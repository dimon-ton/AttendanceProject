// https://script.google.com/macros/s/AKfycbyrJWR7ieDyk3mGQUNVK3tWFHgW33nsm-KJBIUefP-o/dev?page=home
function doGet(e) {
  
  Logger.log('print parameter: ' + e.parameter.id)
  // Logger.log("test e parameter: " + e.parameter['page'])
  // let htmlOutput = HtmlService.createHtmlOutputFromFile('index')

  if (!e.parameter.page && !e.parameter.id) {
    var dataOutput = HtmlService.createTemplateFromFile('index')

    dataOutput.data = getNames()
    
  } else if (e.parameter.id) {

  
      if (e.parameter.method === 'DELETE') {
        let idToDelete = e.parameter.id

        deleteRecord(idToDelete)

      }

      return ContentService.createTextOutput(JSON.stringify({status: "success", "data": "my-data"})).setMimeType(ContentService.MimeType.JAVASCRIPT)

  } else {
    var dataOutput = HtmlService.createTemplateFromFile(e.parameter['page'])
  }

  if (e.parameter.page == "home") {
        dataOutput.data = checkingTable()

  } else if (e.parameter.page == "add-modal") {
        dataOutput.data = getNames() 
  } else {
    //pass
  }





         
      // .setTitle('Student Attendance')
      // .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      // .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      

  
  return dataOutput.evaluate()
          .setTitle("student check")
          .addMetaTag('viewport', 'width=device-width, initial-scale=1')
          .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
          .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        
    
}


function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}


function getNames() {
  let ss = SpreadsheetApp.getActive()
  let sh = ss.getSheetByName('student_list')
  let data = sh.getDataRange().getValues()

  data.shift()

  // transform first index to string type value
  data.forEach((item) => {
    item[0] = item[0].toString()
  })

  return data
  

}

function writeToSheet(checking_date, data_obj) {
  let ss = SpreadsheetApp.getActive()
  let sh = ss.getSheetByName('checking_table')

  let last_row = sh.getLastRow()


/* ##############################################################################################
  snippets that process ID adding the last digit from previous ID to generate new ID with SHA-256 */


  let rngLastID = sh.getRange(`A${last_row}`) // get last id coloum to generate new next id
  let strID = rngLastID.getValue().toString() // convert strID to string
  let last_char_id = strID.split('-') // split string ID with "-"


// ##############################################################################################


  // write unique ID to the column a
  let unique_id = sh.getRange(`A${last_row+1}`)

      let last_uuid = generateUUID()

      if (last_row != 1) {
          last_uuid = last_uuid + '-' + (parseInt(last_char_id[1])+1)
          unique_id.setValue(last_uuid)
      } else {
        last_uuid = last_uuid + '-' + '1'
        unique_id.setValue(last_uuid)
      }
   
      // write date to the sheet
      let cell_date = sh.getRange(`B${last_row+1}`)
      cell_date.setValue(checking_date)

      // write attendance, absent, sick leave, personal leave to the sheet

      let attendance_cell = sh.getRange(`C${last_row+1}`); // attendance students
      let absent_cell = sh.getRange(`D${last_row+1}`); // absent students
      let sickLeave_cell = sh.getRange(`E${last_row+1}`); // sickLeave students
      let personalLeave_cell = sh.getRange(`F${last_row+1}`); // personalLeave students



    for (key in data_obj) {
    
    if (data_obj.hasOwnProperty(key)) {
        if (Array.isArray(data_obj[key])) {
            data_obj[key] = data_obj[key].map(v => {
                 return cvtIDtoName(v)
            });
          }
        }
      }

      attendance_cell.setValue(data_obj.attendace.join(', '))
      absent_cell.setValue(data_obj.absent.join(', '))
      sickLeave_cell.setValue(data_obj.sickLeave.join(', '))
      personalLeave_cell.setValue(data_obj.personalLeave.join(', ')) 

      let updated_data = checkingTable()

      return updated_data

}

function updateProgress() {
    // Simulate a long operation for demonstration purposes
      for (let i = 0; i <= 100; i += 10) {     
        // Simulate a delay
        Utilities.sleep(1000);       
  }
}


function generateUUID() {
   let uuid = Utilities.getUuid();
   let hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, uuid);
   let shortUUID = hash.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('').substring(0, 10); // Adjust the substring length to suit your requirements

  // Logger.log('Shortened UUID:'+ shortUUID);
  // Logger.log('Shortened UUID:'+ shortUUID.substring(shortUUID.length-1, shortUUID.length));
  return shortUUID;
  
}


function getScriptURL() {
  let scriptURL = ScriptApp.getService().getUrl()
  return scriptURL
  
}




function checkingTable() {
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sh = ss.getSheetByName("checking_table")
  let last_row = sh.getLastRow()


  if (last_row != 1) {

      var rngData = sh.getRange(2, 1, last_row-1, 3).getValues() // the values include the first three column
  } else {
     var rngData = []
  }

  rngData.forEach((item) => {
    item[1] = item[1].toLocaleString("th-TH").split(" ")[0] // edit the date to string
  })
  
  rngData.reverse() // reverse the array

  return rngData

}


function deleteRecord(id) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName("checking_table");
  let last_row = sh.getLastRow();


  let dataRange = sh.getRange(2,1,last_row-1,1).getValues() // get the all of ids from first column

  dataRange.forEach((item, index) => {
     dataRange[index] = item[0]; // pull index 0 from nested array and adding to array to make it one dimension array
  })

  // get the number of row from id value
  let rowNumber = dataRange.indexOf(id) + 2; // plus 2 for column name and the zero-base number

  // function to delete row in google sheet
    sh.deleteRow(rowNumber);


}


function cvtIDtoName(strID) {

  /* function to convert each ID to each name */

  let nameData = getNames()

  let foundRow = nameData.find((item) => {
      return item[0] == strID
   })



  if (foundRow) {
    return foundRow[1]
  } else {
    return "ID not found."
  }
}


function idsToNames(strIDs) {

  /* function to convert group of ID to group of name  */


  let IDarr = strIDs.split(',');
  IDarr.forEach((item, index) => {
    IDarr[index] = item.trim();
    
    IDarr[index] = cvtIDtoName(IDarr[index])
    
    
  })

    return IDarr
  
}



function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
  .getContent();
}





