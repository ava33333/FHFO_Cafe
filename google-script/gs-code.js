function doGet(e) {

  if (e.parameter.action == "getAvailability") {
    // return sheet2 data as JSON (for index page)
    // get data from sheet2
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tableSheet = ss.getSheetByName("Sheet2");
    let matrix = tableSheet.getDataRange().getValues();

    let availability = [];
    for(let i = 1; i < matrix.length - 1; i++) {
      availability.push({
        tableNumber: matrix[i][0],
        time: matrix[i][1],
        seatsTaken: matrix[i][2],
        status: matrix[i][3]
      });
    }

    return ContentService.createTextOutput(JSON.stringify(availability)).setMimeType(ContentService.MimeType.JSON);

  } else { // new reservation

    // get spreadsheet data
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const tablesSheet = ss.getSheetByName("Sheet2");

    let matrix = tablesSheet.getDataRange().getValues();
   
    const result = findAvailableTable(matrix, e.parameter.time, parseInt(e.parameter.partySize));

    if(!result.found) {
      // write back to github (and exit function)
      return HtmlService.createHtmlOutput("<script>window.location.href='https://ava33333.github.io/FHFO_Cafe/reservation_unavailable.html'</script>");

    }

    const reservationsSheet = ss.getSheetByName("Sheet1");

    const existingReservations = reservationsSheet.getDataRange().getValues();

    
    //check for existing email
    for (let i = 1; i < existingReservations.length; i++) {
      if (e.parameter.email == existingReservations[i][4]) {
        return HtmlService.createHtmlOutput("<script>window.location.href='https://ava33333.github.io/FHFO_Cafe/duplicate_email.html'</script>");
      }
    }

    email(e.parameter.email, e.parameter.time, e.parameter.name);

    // write to sheet 1
    reservationsSheet.appendRow([matrix[result.x][0], "confirmed", e.parameter.name, parseInt(e.parameter.partySize), e.parameter.email, e.parameter.time, new Date()]);

    // sheet2 values
    const updatedSize = parseInt(e.parameter.partySize) + matrix[result.x][2];
    const newStatus = determineStatus(parseInt(e.parameter.partySize), matrix[result.x][2]);
    
    // write to sheet 2
    tablesSheet.getRange(result.x + 1, 3).setValue(updatedSize);
    tablesSheet.getRange(result.x + 1, 4).setValue(newStatus);

    // tell github that it was successful
    return HtmlService.createHtmlOutput("<script>window.location.href='https://ava33333.github.io/FHFO_Cafe/reservation_success.html'</script>");
  }

}

function findAvailableTable(matrix, time, partySize) {
  let found = false;
  let x = 0;

    for(let i = 0; i < matrix.length - 1; i++) {
    // if the time 
    if (matrix[i][1] == time) {
      // if open or community table
      // and the table isnt full
      // partysize + tablesize is <= 4 (aka won't overflow)
      if((matrix[i][3] == "open" || matrix[i][3] == "community") && matrix[i][2] < 4 && (matrix[i][2] + partySize <= 4)) {
        found = true;
        x = i; // save which table it is
        break;
      }      
    }
  }
  return {found: found, x: x};
}

function email(email_address, time, name) {
  // send email
  MailApp.sendEmail({
    to: email_address, 
    subject: "FHFO Café Reservation Confirmation", 
    htmlBody: "<h1>Your reservation is confirmed!</h1><p>We will see you at the French House on March 25th!<br><br><strong>Reservation details:</strong><br>Date: Wednesday, March 25th<br><br>Time: " + time + 
    "<br><br>Reservation Name: " 
    + name + 
    "<br><br>Address: 6 Bull St, Charleston, SC 29401 <br><br>Thank you for making a reservation with FHFO! If you need to change or cancel your reservation, please reach out to Ava McDonald (mcdonaldal@g.cofc.edu)</p>"});

}

function determineStatus(partySize, tableSize) {
  // if the table is community
  if(partySize < 3 && partySize + tableSize < 4) {
    return "community";
  } else { // if table is closed
    return "closed";
  }

}

function reminderEmailInfo() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const reservationsSheet = ss.getSheetByName("Sheet1");

    let matrix2 = reservationsSheet.getDataRange().getValues();

    let reservationInfo = [];
    for(let i = 1; i< matrix2.length; i++) {
      if (i + 1 < matrix2.length && matrix2[i][4] == matrix2[i + 1][4]) {
        reservationInfo.push({
          email : matrix2[i][4],
          time : Utilities.formatDate(new Date(matrix2[i][5]), "America/New_York", "h:mm a").toUpperCase(),
          partySize1: matrix2[i][3],
          partySize2: matrix2[i + 1][3],
          name: matrix2[i][2]
        });
        i++
      }
      else {
        reservationInfo.push({
          email : matrix2[i][4],
          time: Utilities.formatDate(new Date(matrix2[i][5]), "America/New_York", "h:mm a").toUpperCase(),
          partySize: matrix2[i][3],
          name: matrix2[i][2]
        });
      }
    }

    sendReminderEmail(reservationInfo);
}

function sendReminderEmail(matrix) {
  for(let i = 0; i < matrix.length; i++) {
    // test for now
    if (matrix[i].email != "mcdonaldal@g.cofc.edu") {
      continue;
      }
    
    // if person has two reservations
    if (matrix[i].partySize1) {
      MailApp.sendEmail({
      to: matrix[i].email, 
      from: "mcdonaldal@g.cofc.edu",
      subject: "Reminder: FHFO Café & Crêpes Reservation Today!", 
      htmlBody: "<h2>Reminder that the FHFO Café is <strong>today</strong>! See reservation info below.</h2><h3>Reservation details:</h3><p>Date: <strong> Today!</strong> Wednesday, March 25th<br><br>You submitted two reservations for: <strong>" + matrix[i].time + 
      "</strong><br><br>Reservation Name: " 
      + matrix[i].name + 
      "<br><br>Reservation 1 Size: " +
      matrix[i].partySize1 + 
      "<br><br>Reservation 2 Size: " +
      matrix[i].partySize2 + 
      "<strong><br><br>Your reservations will be treated as one reservation for " +
      + (parseInt(matrix[i].partySize1) + parseInt(matrix[i].partySize2))+
      " people.</strong><br><br>Address: 6 Bull St, Charleston, SC 29401 <br><br>We look forward to seeing you today! If there is a mistake with your reservation or you need to cancel, please reach out to Ava McDonald (mcdonaldal@g.cofc.edu)<br><br>- French House and Friends Team</p>"});

    } 
    else { // if person has one reservation

      MailApp.sendEmail({
      to: matrix[i].email, 
      from: "mcdonaldal@g.cofc.edu",
      subject: "Reminder: FHFO Café & Crêpes Reservation Today!", 
      htmlBody: "<h2>Reminder that the FHFO Café is <strong>today</strong>! See reservation info below.</h2><h3>Reservation details:</h3><p>Date: <strong> Today!</strong> Wednesday, March 25th<br><br>Reservation time: <strong>" + matrix[i].time + 
      "</strong><br><br>Reservation Name: " 
      + matrix[i].name + 
      "<br><br>Party Size: " +
      matrix[i].partySize + 
      "<br><br>Address: 6 Bull St, Charleston, SC 29401 <br><br>We look forward to seeing you today! If there is a mistake with your reservation or you need to cancel, please reach out to Ava McDonald (mcdonaldal@g.cofc.edu)<br><br>- French House and Friends Team</p>"});   
    }

    Utilities.sleep(1000);


  } 

}
