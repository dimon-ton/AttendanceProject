// `https://script.google.com/macros/s/AKfycbyrJWR7ieDyk3mGQUNVK3tWFHgW33nsm-KJBIUefP-o/dev?page=home`

function doGet(e) {

  Logger.log(e)
  Logger.log(e.parameter)
  Logger.log(e.parameter.page)
  

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
        dataOutput.data = getNames(); 

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

  Logger.log(data)
  return data

}

function writeToSheet(checking_date, data_obj) {

  let ss = SpreadsheetApp.getActive()
  let sh = ss.getSheetByName('checking_table')

  let last_row = sh.getLastRow()


  if (last_row != 1) {

     // write algorithm to check the duplicated date
    let check_date_data = sh.getRange(2,2,last_row-1,1).getValues();
    Logger.log(check_date_data)
    const isDuplicated = check_date_data.some(row => {

      let date_to_check = new Date(checking_date)
      date_to_check.setHours(0,0,0,0)

      return row[0].toISOString() == date_to_check.toISOString(); // Return true if a match is found
    });

    if (isDuplicated) {
      return ['date duplicated'];
    }

}

  
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



    // for (key in data_obj) {
    
    // if (data_obj.hasOwnProperty(key)) {
    //     if (Array.isArray(data_obj[key])) {
    //         data_obj[key] = data_obj[key].map(v => {
    //              return cvtIDtoName(v)
    //         });
    //       }
    //     }
    //   }


      attendance_cell.setValue(data_obj.attendace.join(', '))
      absent_cell.setValue(data_obj.absent.join(', '))
      sickLeave_cell.setValue(data_obj.sickLeave.join(', '))
      personalLeave_cell.setValue(data_obj.personalLeave.join(', ')) 

      let updated_data = checkingTable()

      return updated_data

}


function editRecord(id, data_obj) {
  Logger.log("edit is process: " + id)
  // verify the id and check what row of id to edit
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sh = ss.getSheetByName("checking_table")
  let last_row = sh.getLastRow()

  let dataRange = sh.getRange(2,1,last_row-1,1).getValues() // get the all of ids from first column

  dataRange.forEach((item, index) => {
     dataRange[index] = item[0]; // pull index 0 from nested array and adding to array to make it one dimension array
  });

  // get the number of row from id value
  let rowNumber = dataRange.indexOf(id) + 2; // plus 2 for column name and the zero-base number

  Logger.log("rowNumber:" + rowNumber)
  
  // eidt the row
  let cell_date = sh.getRange(`B${rowNumber}`)
  let attendance_cell = sh.getRange(`C${rowNumber}`); // attendance students
  let absent_cell = sh.getRange(`D${rowNumber}`); // absent students
  let sickLeave_cell = sh.getRange(`E${rowNumber}`); // sickLeave students
  let personalLeave_cell = sh.getRange(`F${rowNumber}`); // personalLeave students

  let attendance_cell_arr = [];
  let absent_cell_arr = [];
  let sickLeave_cell_arr = [];
  let personalLeave_cell_arr = [];


  for (key in data_obj) {

    if (data_obj[key] == 'มา') {
      attendance_cell_arr.push(key)
    } else if (data_obj[key] == 'ขาด') {
      absent_cell_arr.push(key)
    } else if (data_obj[key] == 'ป่วย') {
      sickLeave_cell_arr.push(key)
    } else if (data_obj[key] == 'ลากิจ') {
      personalLeave_cell_arr.push(key)
    } 
  
  }

  attendance_cell.setValue(attendance_cell_arr.join(', '))
  absent_cell.setValue(absent_cell_arr.join(', '))
  sickLeave_cell.setValue(sickLeave_cell_arr.join(', '))
  personalLeave_cell.setValue(personalLeave_cell_arr.join(', '))
  cell_date.setValue(data_obj.checkDateEdit)


  Logger.log("attendance_cell_arr:" + attendance_cell_arr)
  Logger.log("dateEdit" + data_obj.checkDateEdit)

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


function checkingTable() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName("checking_table");
  const lastRow = sh.getLastRow();

  if (lastRow <= 1) return [];

  const data = sh.getRange(2, 1, lastRow - 1, 6).getValues(); // แถวที่ 2 ถึงสุดท้าย, 6 คอลัมน์
  const structuredData = [];

  data.forEach(row => {
    const [id, date, attendanceStr, absentStr, sickLeaveStr, personalLeaveStr] = row;

    // แปลงสตริงให้กลายเป็น array ของตัวเลข (trim ด้วยนะเธอ~)
    const parseToArray = str =>
      str
        ? str.toString().split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n))
        : [];

    structuredData.push({
      ID: id,
      date: Utilities.formatDate(new Date(date), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      attendance: parseToArray(attendanceStr),
      absent: parseToArray(absentStr),
      sick_leave: parseToArray(sickLeaveStr),
      personal_leave: parseToArray(personalLeaveStr)
    });
  });

  Logger.log(JSON.stringify(structuredData, null, 2));
  return structuredData.reverse(); // กลับลำดับ array เพื่อให้แสดงวันที่ล่าสุดอยู่ด้านบนสุด
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


function filterTranByID(ID) {

  // get values from checking_table by ID
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let sh = ss.getSheetByName("checking_table")
  let last_row = sh.getLastRow()


  if (last_row != 1) {

     var rngData = sh.getRange(2, 1, last_row-1, 6).getValues() // the values include the first three column
  } else {
     var rngData = []
  }


    rngData.forEach((item) => {
      item[1] = item[1].toLocaleString("th-TH").split(" ")[0] // edit the date to string
    })
    
    rngData.reverse() // rngData return value of date as string in format of <<Budhist year>>.
  
    let filteredRow = rngData.filter(row => row[0] == ID); // filter specific date
  
    if (filteredRow.length > 0) {


      function convertStringToArray(str) {
        let array;
        if (typeof str === 'number') { // check if it is string and only has one member

           array = [str.toString()];

        } else if (typeof str === 'string') {
           array = str.split(",").map(function(item) { 
            return (item.trim());
          });
        } else {
          array = []
        }
 
        return array
      }
      
      let obj_student = {
        ids: filteredRow[0][0],
        date: filteredRow[0][1],
        attendances: convertStringToArray(filteredRow[0][2]),
        absents: convertStringToArray(filteredRow[0][3]),
        sick_leaves: convertStringToArray(filteredRow[0][4]),
        personal_leaves: convertStringToArray(filteredRow[0][5])

      }

      Logger.log (obj_student)
      return obj_student

    }

}




function formatDate(inputDate) {
  // Parse the input date string into a Date object
  const date = new Date(inputDate);

  // Extract year, month, and day
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  // Return the formatted date as "yyyy-mm-dd"
  return `${year}-${month}-${day}`;
}
