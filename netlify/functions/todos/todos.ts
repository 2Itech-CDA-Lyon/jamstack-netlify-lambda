import createConnectionPool from '@databases/pg';
import tables from '@databases/pg-typed';
import { Handler } from '@netlify/functions'
import dotenv from 'dotenv';
import DatabaseSchema, {serializeValue} from '../../../__generated__';
import Todos from '../../../__generated__/todos';

// Read environment variables from .env file
dotenv.config();

const {
  DB_USERNAME,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

class NotFoundException extends Error {

}

class MethodNotAllowedException extends Error {
  public httpMethod: string;

  constructor(httpMethod: string) {
    super();
    this.httpMethod = httpMethod;
  }
}

export const handler: Handler = async (event, context) => {
  // Establish connection with database
  const db = createConnectionPool(
    `postgres://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`
  );

  // Get todos handler
  const { todos } = tables<DatabaseSchema>({
    serializeValue,
  });

  try {
    let match: RegExpMatchArray;
    let result: Todos[] | Todos;
    let statusCode = 200;
    // If lambda was called without an ID
    if (event.path.match(/^\/\.netlify\/functions\/[^\/]+$/)) {
      switch (event.httpMethod) {
        // Find all
        case 'GET':
          result = await todos(db).find().all();
          break;

        // Create
        case 'POST':
          result = (await todos(db).insert(JSON.parse(event.body)))[0];
          statusCode = 201;
          break;

        // Method not allowed
        default:
          throw new MethodNotAllowedException(event.httpMethod);
      }

    // If lambda was called with an ID
    } else if (match = event.path.match(/^\/\.netlify\/functions\/[^\/]+\/(\d+)$/)) {
      const id = Number(match[1]);
      switch (event.httpMethod) {
        // Find by ID
        case 'GET':
          result = await todos(db).findOne({ id });
          console.log(result);
          if (result === null) {
            throw new NotFoundException();
          }
          break;

        // Update
        case 'PATCH':
        case 'PUT':
          result = (await todos(db).update({ id }, JSON.parse(event.body)))[0];
          if (typeof result === 'undefined') {
            throw new NotFoundException();
          }
          break;

        // Delete
        case 'DELETE':
          result = await todos(db).findOne({ id });
          if (result === null) {
            throw new NotFoundException();
          } else {
            await todos(db).delete({ id });
            statusCode = 204;
            result = null;
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
    // Terminate connection with database
    await db.dispose();
    
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
    if (error instanceof NotFoundException) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ error: 'Resrouce not found.' })
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
