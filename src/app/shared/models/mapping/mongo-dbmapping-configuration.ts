export class MongoDBMappingConfiguration {
  public connectionString: string;
  public databaseName: string;
  public mapping: MongoDBCollectionMapping[];
  public mappingId: string;
  constructor(config?) {
    if (config) {
      this.connectionString = config.connectionString;
      this.databaseName = config.databaseName;
      this.mappingId = config.mappingId;
      if (config.mapping) {
        config.mapping.forEach( m => this.addMapping(new MongoDBCollectionMapping(m)));
      }
    } else {
      this.mappingId = this.generateId();
    }
  }
  addMapping(mapping: MongoDBCollectionMapping) {
    this.mapping = this.mapping ? this.mapping : [];
    const matchedCollection = this.doesMappingExist(mapping);
    if (matchedCollection) {
      // TODO: Just add the field to the collection
      console.error('not yet implemented');
    } else {
      this.mapping.push(mapping);
    }
  }
  doesMappingExist(mapping: MongoDBCollectionMapping): MongoDBCollectionMapping {
    if (this.mapping) {
      const match = this.mapping.find( c => c.collectionName === mapping.collectionName );
      return match ? match : null;
    } else {
      return null;
    }
  }
  generateId(): string {
    const now = new Date().getTime();
    return `mapping_${now}`;
  }
}

export class MongoDBCollectionMapping {
  public collectionName: string;
  constructor(mapping?) {
    if (mapping) {
      this.collectionName = mapping.collection || mapping.collectionName;
    }
  }
}