import faunadb from 'faunadb';
import faunaClient from './fauna-client.mjs';
const fql = faunadb.query;

// This script migrates the database schema to the database server
const run = async () => {
  // Establish connection with database
  console.info('Connecting to database...');
    
  console.info('Migrating schema...')
  await faunaClient.query(
    fql.If(
      fql.Exists(
        fql.Collection('Todos')
      ),
      null,
      fql.CreateCollection({ name: 'Todos' })
    )
  );

  await faunaClient.query(
    fql.If(
      fql.Exists(
        fql.Index('all_todos')
      ),
      null,
      fql.CreateIndex({
        name: 'all_todos',
        source: fql.Collection('Todos')
      })  
    )
  );
}

// Run main process
run().catch((err) => {
  console.error(err);
  process.exit(1);
});
