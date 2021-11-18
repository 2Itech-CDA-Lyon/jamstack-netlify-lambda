import { Handler } from '@netlify/functions'
import dotenv from 'dotenv';
import { Todo, TodoInput } from '../../../src/types/api';

// Require the driver
import faunadb from 'faunadb';
const fql = faunadb.query;

// Read environment variables from .env file
dotenv.config();

// Acquire the secret and optional endpoint from environment variables
const secret = process.env.FAUNA_SECRET;

// Instantiate a client
const client = new faunadb.Client({
  secret,
  domain: 'db.eu.fauna.com',
  port: 443,
  scheme: 'https',
});

class NotFoundException extends Error {

}

class MethodNotAllowedException extends Error {
  public httpMethod: string;

  constructor(httpMethod: string) {
    super();
    this.httpMethod = httpMethod;
  }
}

class BadRequestException extends Error {
  public reason: string;

  constructor(reason: string) {
    super();
    this.reason = reason;
  }
}

const validatePayload = (payload: any, partial: boolean = false): TodoInput => {
  console.log('partial = ', partial);
  if (
    (partial === false && (
      typeof payload.text !== 'string'
      || typeof payload.done !== 'boolean'
    ))
    || (partial === true && (
      (typeof payload.text !== 'undefined' && typeof payload.text !== 'string')
      || (typeof payload.done !== 'undefined' && typeof payload.done !== 'boolean')
    ))
  ) {
    throw new BadRequestException('Payload incorrectly formed.');  
  }
  return payload;
}

export const handler: Handler = async (event, context) => {
  try {
    let match: RegExpMatchArray;
    let result: Todo[] | Todo;
    let statusCode = 200;
    let partial = false;
    // If lambda was called without an ID
    if (event.path.match(/^\/\.netlify\/functions\/[^\/]+$/)) {
      switch (event.httpMethod) {
        // Find all
        case 'GET':
          result = (await client.query<{ data: Todo[] }>(
            fql.Map(
              fql.Paginate(
                fql.Match(fql.Index('all_todos'))
              ),
              fql.Lambda('todo_ref', fql.Get(fql.Var('todo_ref')))
            )
          )).data;
          break;

        // Create
        case 'POST':
          result = await client.query(
            fql.Create(
              fql.Collection('Todos'),
              {
                data: validatePayload(
                  JSON.parse(event.body)
                ),
              }
            )
          )
          statusCode = 201;
          break;

        // Method not allowed
        default:
          throw new MethodNotAllowedException(event.httpMethod);
      }

    // If lambda was called with an ID
    } else if (match = event.path.match(/^\/\.netlify\/functions\/[^\/]+\/(\d+)$/)) {
      const id = match[1];
      switch (event.httpMethod) {
        // Find by ID
        case 'GET':
          try {
            result = await client.query<Todo>(
              fql.Get(
                fql.Ref(
                  fql.Collection('Todos'),
                  id
                )
              )
            );
          }
          catch (error) {
            if (error.requestResult.statusCode === 404) {
              throw new NotFoundException();
            }
            throw error;
          }
          break;

        // Update
        case 'PATCH':
          partial = true;

        case 'PUT':
          try {
            result = await client.query(
              fql.Update(
                fql.Ref(
                  fql.Collection('Todos'),
                  id
                ),
                {
                  data: validatePayload(
                    JSON.parse(event.body),
                    partial
                  )
                }
              )
            );
          }
          catch (error) {
            if (error.statusCode === 404) {
              throw new NotFoundException();
            }
            throw error;
          }
          break;

        // Delete
        case 'DELETE':
          try {
            await client.query(
              fql.Delete(
                fql.Ref(
                  fql.Collection('Todos'),
                  id
                )
              )  
            )
            result = null;
            statusCode = 204;
          }
          catch (error) {
            if (error.requestResult.statusCode === 404) {
              throw new NotFoundException();
            }
            throw error;
          }
          break;

        // Method not allowed
        default:
          throw new MethodNotAllowedException(event.httpMethod);
      }
    
    // If lambda was called with inappropriate arguments
    } else {
      throw new NotFoundException();
    }
    
    // Create HTTP response
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: result === null ? '' : JSON.stringify(result),
    }
  }
  catch (error) {
    if (error instanceof BadRequestException) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: error.reason })
      }
    }
    if (error instanceof NotFoundException) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Resource not found.' })
      }
    }
    if (error instanceof MethodNotAllowedException) {
      return {
        statusCode: 405,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: `Method ${error.httpMethod} not allowed.` })
      }
    }
    throw error;
  }
}
