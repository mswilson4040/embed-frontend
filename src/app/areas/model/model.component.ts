import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatSidenav, MatTableDataSource } from '@angular/material';
import { NewConnectionDailogComponent } from '../../shared/dialogs/new-connection-dailog/new-connection-dailog.component';
import { MongoDBConnection } from '../../shared/models/connections/mongo-dbconnection';
import { DatabaseService } from '../../shared/services/database.service';
import { MongoMapping } from '../../shared/models/mapping/mongo-mapping';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';
import { CollectionLinkDialogComponent } from '../../shared/dialogs/collection-link-dialog/collection-link-dialog.component';
import {
  MongoDBCollectionMapping,
  MongoDBMappingConfiguration
} from '../../shared/models/mapping/mongo-dbmapping-configuration';
import { MongoConfigurationService } from '../../shared/services/mongo-configuration.service';
import { OpenMappingDialogComponent } from '../../shared/dialogs/open-mapping-dialog/open-mapping-dialog.component';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss']
})
export class ModelComponent implements OnInit {
  public matDialog: MatDialog;
  public databaseService: DatabaseService;
  public collections: { primary: boolean, fields: string[], collection: string }[];
  public dataSource: MatTableDataSource<any>;
  public displayColumns: string[] = [];

  public mapping: MongoDBMappingConfiguration;
  private _mongoConfigService: MongoConfigurationService;
  @ViewChild(MatSidenav) sidenav: MatSidenav;
  constructor(_matDialog: MatDialog, _databaseService: DatabaseService, _mongoConfigService: MongoConfigurationService) {
    this.matDialog = _matDialog;
    this.databaseService = _databaseService;
    this.dataSource = new MatTableDataSource<any>([]);
    this._mongoConfigService = _mongoConfigService;
  }

  ngOnInit() {
    this._mongoConfigService.mappingEmitter.subscribe( (_mapping: MongoDBMappingConfiguration) => {
      if (_mapping) {
        this.mapping = _mapping;
        const primaryCollection = this.mapping.getPrimaryCollection();
        console.log('p', primaryCollection);
        if (primaryCollection) {
          this.updateCollectionLookup(primaryCollection);
        }
      }
    });
  }
  updateCollectionLookup(primaryCollection: MongoDBCollectionMapping) {
    if (this.collections) {
      this.collections.forEach( c => {
        c.primary = false;
        if ( c.collection === primaryCollection.collectionName ) {
          c.primary = true;
        }
      } );
    }
  }
  onNewModel(): void {
    const dialogRef = this.matDialog.open(NewConnectionDailogComponent, {});
    dialogRef.afterClosed().subscribe( async (_mapping: MongoDBMappingConfiguration) => {
      if (_mapping) {
        this._mongoConfigService.setCurrentMapping(_mapping);
        this.collections = await this.loadSelectedCollectionsInfo(_mapping);
        await this.sidenav.open();
      }
    });
  }
  async loadSelectedCollectionsInfo(mapping: MongoDBMappingConfiguration) {
    const res: any = await this.databaseService.getBulkCollectionInfo(mapping);
    res.forEach( c => c.primary = false);
    return res;
  }
  async save(): Promise<void> {
    console.log('save-input', this.mapping);
    const res = await this._mongoConfigService.save(this.mapping);
    console.log('save-output', res);
  }
  async open() {
    const configs = await this._mongoConfigService.getMappings();
    const dialogRef = this.matDialog.open(OpenMappingDialogComponent, { data: configs });
    dialogRef.afterClosed().subscribe( async _mapping => {
      const mapping = await this._mongoConfigService.getMapping(_mapping.mappingId);
      this._mongoConfigService.setCurrentMapping(mapping);
      this.collections = await this.loadSelectedCollectionsInfo(mapping);
      const primaryCollection = mapping.getPrimaryCollection();
      if (primaryCollection) {
        this.updateCollectionLookup(primaryCollection);
      }
      await this.sidenav.open();
    });
  }
  async onDrop(evt) {
    // evt.preventDefault();
    // const data = JSON.parse(evt.dataTransfer.getData('text'));
    // console.log(data);

    // evt.preventDefault();
    // const droppedField = JSON.parse(evt.dataTransfer.getData('text'));
    // const collection = this.collections.find( c => c.collection === droppedField.collection);
    // if ( !this.mapping.getPrimaryCollection() ) {
    //   const dialogRef = this.matDialog.open( ConfirmDialogComponent );
    //   dialogRef.afterClosed().subscribe( async _res => {
    //     if ( _res ) {
    //       collection.primary = true;
    //       droppedField.primary = true;
    //       this.mapping.addMapping( droppedField );
    //       this.displayColumns = this.mapping.getDisplayColumns();
    //       const data: any = await this.databaseService.getSampleData( this.config, this.mapping );
    //       this.dataSource = new MatTableDataSource<any>( data );
    //     }
    //   } );
    // } else {
    //   if ( this.mapping.doesCollectionExist( droppedField.collection ) ) {
    //     this.mapping.addMapping( droppedField );
    //     this.displayColumns = this.mapping.getDisplayColumns();
    //     const data: any = await this.databaseService.getSampleData( this.config, this.mapping );
    //     this.dataSource = new MatTableDataSource<any>( data );
    //   } else {
    //     const dialogRef = this.matDialog.open( CollectionLinkDialogComponent, {
    //       data: {
    //         primaryCollectionFields: this.mapping.getPrimaryCollection().fields,
    //         currentCollectionFields: this.collections.find( c => c.collection === droppedField.collection ).fields
    //       }
    //     } );
    //     dialogRef.afterClosed().subscribe( async _res => {
    //       if ( _res ) {
    //         console.log( _res );
    //         droppedField.localField = _res.localField;
    //         droppedField.foreignField = _res.primaryField;
    //         this.mapping.addMapping( droppedField );
    //         this.displayColumns = this.mapping.getDisplayColumns();
    //         const data: any = await this.databaseService.getSampleData( this.config, this.mapping );
    //         this.dataSource = new MatTableDataSource<any>( data );
    //
    //       }
    //     } );
    //   }
    // }
  }
  onDragStart(evt, collection, field): void {
    evt.dataTransfer.setData('text', JSON.stringify({ collection: collection, field: field } ));
  }
  allowDrop(evt): void {
    evt.preventDefault();
  }
  onPrimaryCollectionChange(collection) {
    // this.collections.forEach( c => { c.primary = false; });
    // // collection.primary = !collection.primary;
    // if (this.mapping.view.length > 0) {
    //   this.mapping.view.forEach( c => { c.primary = false; } );
    //   const col = this.mapping.view.find( c => c.name === collection.collection );
    //   col.primary = !col.primary;
    // }
  }

}
