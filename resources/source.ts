import { Realm } from './realm';

export interface DataSource {
  /**
   * file-name, object-key, collection-name, table-name
   */
   match: string; //  example if trail points to a zip-file: match the entry-record fileName

   /**
    * Discriminator
    */
   realm: Realm;
   
   /**
    * To support versioning
    */
   track?: string;
   
   /**
    * It is like path but in reverse
    */
   trail: string[]; // [{bucket}, {endpoint}], [{...path-to-file}], [{db-name}, {host}]
}