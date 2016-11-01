import {Component, ViewChild, ElementRef, Renderer, OnInit} from '@angular/core';
import {ChangeDetectionStrategy} from '@angular/core';
// used free controls (for example, DataGrid) are from here http://www.primefaces.org/primeng/#/

const {remote, ipcRenderer} = require('electron');
const mainProcess = remote.require('../app_electron/main.js');
const {showOpenFileDialog, connectToMongoAndGetCollectionsList, startDataWriting} = mainProcess;

const SelectCollection = "-- Select Collection --";

const EVENT_TYPES = {
  CSV_FILE_PARSED: 'csv-file-parsed',
  ERROR_MESSAGE: 'error-message',
  COLLECTIONS_LIST_READY: 'collections-list-ready',
  DATA_WRITING_COMPLETED: 'data-writing-completed'
};

@Component({
  moduleId: module.id,
  selector: 'my-app',
  templateUrl: 'app.component.html',
  providers: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AppComponent implements OnInit {
  private fileContent: any[] = null;
  private columnsNames: string[] = null;
  private csvFileName: string;
  private mongoCollectionsList: string[] = null; // mongoDb collections list in selected database
  private selectedCollection: string = '';
  @ViewChild('myButton') myButton: ElementRef;
  @ViewChild('controlsDiv') controlsDiv: ElementRef;

  constructor(private renderer: Renderer) {
    this.initialize();

    ipcRenderer.on(EVENT_TYPES.CSV_FILE_PARSED, (event: any, fileName: string, columns: string[], csvRecords: any[]) => {
      this.csvFileName = fileName;
      if (csvRecords.length === 0) {
        this.fileContent = null;
      }
      else {
        this.fileContent = csvRecords;
      }
      this.columnsNames = columns;
      this.updateInterfaceTrick();
    });

    ipcRenderer.on(EVENT_TYPES.ERROR_MESSAGE, (event: any, errorMessage: string) => {
      alert('Error. ' + errorMessage);
      this.initialize();
      this.updateInterfaceTrick();
    });

    ipcRenderer.on(EVENT_TYPES.COLLECTIONS_LIST_READY, (event: any, collections: string[]) => {
      collections.unshift(SelectCollection);
      this.mongoCollectionsList = collections;
      this.updateInterfaceTrick()
    });

    ipcRenderer.on(EVENT_TYPES.DATA_WRITING_COMPLETED, (event: any, recordsNumber: number) => {
      this.setCursor('default');
      this.initialize();
      connectToMongoAndGetCollectionsList();
      alert('Data writing to mongoDb is completed. ' + recordsNumber.toString() + ' records had been added.');
      this.updateInterfaceTrick();
    });
  }


  collectionSelected(selectedValue: string) {
    if (selectedValue === SelectCollection) {
      this.selectedCollection = '';
    }
    else {
      this.selectedCollection = selectedValue;
    }
  }


  copyCsvClicked(collectionName: string) {
    if (collectionName.trim() === '') {
      alert("Collection name is not selected. Select the collection name. It is editable if you need to change it.");
      return;
    }
    this.setCursor('wait');
    startDataWriting(collectionName.trim()); // write the data to mongoDb on server (Node.js) side
  }


  initialize() {
    this.csvFileName = "Select CSV file";
    this.fileContent = null;
    this.columnsNames = null;
  }


  readCsvClicked() {
    // open file on server side
    this.initialize();
    showOpenFileDialog();
  }


  updateInterfaceTrick() {
    // The "brute force" trick to update an interface. It is to resolve the issue with external event handler.
    // If variables are assigned inside external event handler the interface is not updated (Electron + Angular 2 issue?)
    // one day googling and various experiments did not lead to more elegant solution!
    this.renderer.invokeElementMethod(this.myButton.nativeElement, 'click');
  }


  hiddenUpdate() { // trick to update interface after data update (method processes the click on hidden button)
  }


  ngOnInit(): void {
    connectToMongoAndGetCollectionsList();
  }


  setCursor(cursorType: string): void { // sets cursor to wait or default and call disable/enable controls
    if (cursorType === 'wait') {
      document.body.style.cursor = 'wait';
      this.disableAllElements(true);
    }
    else {
      this.disableAllElements(false);
      document.body.style.cursor = 'default';
    }
  }


  // method to disable HTML controls while csv records writing to mongoDb is in progress and enable them back after writing process completing.
  disableAllElements(disabled: boolean): void { // true - disable all controls, false - enable all controls
    if (disabled) {
      this.controlsDiv.nativeElement.style = 'opacity: 0.4;pointer-events:none;';
    }
    else {
      this.controlsDiv.nativeElement.style = '';
    }
  }
}

