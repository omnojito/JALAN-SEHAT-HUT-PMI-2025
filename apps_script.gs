// Google Apps Script for Google Sheet backend
function doGet(e){
  var action = e.parameter.action || 'read';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  if(action == 'read'){
    var data = sheet.getDataRange().getValues();
    var out = [];
    for(var i=1;i<data.length;i++){
      out.push({ row: i+1, nama: data[i][0], alamat: data[i][1], nik: data[i][2], instansi: data[i][3], kupon: data[i][4] });
    }
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
  } else if(action == 'delete'){
    var row = parseInt(e.parameter.row,10);
    if(row && row>1){
      sheet.deleteRow(row);
      return ContentService.createTextOutput(JSON.stringify({status:'deleted'})).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(JSON.stringify({status:'error',message:'invalid row'})).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({status:'unknown action'})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  var action = (e.parameter && e.parameter.action) || 'create';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var body = e.postData && e.postData.contents ? e.postData.contents : null;
  if(!body) return ContentService.createTextOutput(JSON.stringify({status:'error',message:'no body'})).setMimeType(ContentService.MimeType.JSON);
  var data = JSON.parse(body);
  if(action == 'create'){
    sheet.appendRow([data.nama || '', data.alamat || '', data.nik || '', data.instansi || '', data.kupon || '']);
    return ContentService.createTextOutput(JSON.stringify({status:'created'})).setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(JSON.stringify({status:'unknown action'})).setMimeType(ContentService.MimeType.JSON);
  }
}
