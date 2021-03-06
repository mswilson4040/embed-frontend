import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatSelectionList, MatStepper } from '@angular/material';
import { MongoDBConnection } from '../../models/connections/mongo-dbconnection';
import { DatabaseService } from '../../services/database.service';
import {
  MongoDBCollectionMapping,
  MongoDBMappingConfiguration
} from '../../models/mapping/mongo-dbmapping-configuration';

@Component({
  selector: 'app-new-connection-dailog',
  templateUrl: './new-connection-dailog.component.html',
  styleUrls: ['./new-connection-dailog.component.scss']
})
export class NewConnectionDailogComponent implements OnInit {
  public matDialogRef: MatDialogRef<NewConnectionDailogComponent>;
  public connectionConfig: MongoDBConnection = new MongoDBConnection();
  public databaseService: DatabaseService;
  public databases = [];
  public collections: { collectionName: string }[];
  @ViewChild(MatSelectionList) collectionsList: MatSelectionList;

  public mapping: MongoDBMappingConfiguration;

  constructor(_matDialogRef: MatDialogRef<NewConnectionDailogComponent>, _databaseService: DatabaseService) {
    this.matDialogRef = _matDialogRef;
    this.databaseService = _databaseService;
  }

  ngOnInit() {
    this.matDialogRef.updateSize('600px', '600px');
  }
  onConnectionSelected(connection: string, stepper: MatStepper) {
    switch (connection) {
      case 'MongoDB':
        this.mapping = new MongoDBMappingConfiguration();
        break;
      default:
        this.connectionConfig = null;
        break;
    }
    stepper.next();
  }
  async onConnectionStringChanged() {
    this.databases = await this.getDatabases();
  }
  async onDatabaseChange() {
    this.collections = await this.getCollections();
  }
  async getDatabases() {
    const databases: any = await this.databaseService.getDatabases(this.mapping);
    return databases;
  }
  async getCollections(): Promise<{ collectionName: string }[]> {
    const collections: { collectionName: string }[] = await this.databaseService.getCollections(this.mapping);
    return collections;
  }
  save(): void {
    const collections = this.collectionsList.selectedOptions.selected.map( item => item.value);
    collections.forEach( c => this.mapping.addMapping(new MongoDBCollectionMapping(c)));
    this.matDialogRef.close(this.mapping);
  }

}
