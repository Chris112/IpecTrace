// PhotoSearch.js
// 7/11/2016


// Setup page
$("#barcodeTable").hide();
$("#senderTable").hide();
$("#itemCount").hide();
$("#errorMessage").hide();
$("#content").hide();
$('#photoTrackButton').hide();

// Item class 
function Item(itemNumber) {
    this.itemNumber = itemNumber;
    this.itemLoc = "";
    this.lastScan = "";
    this.status = "No scan found";
}

// Page Variables
var itemCount = 0;
var destSuburb = "none";
var destPostcode = -1;
var destAddress = "none"; //unused at this stage
var destName = "none";
var senderSuburb = "none";
var senderPostcode = -1;
var senderAddress = "none"; //unused at this stage
var senderName = "none";
var items = [];


// Update table of barcodes
function updateTable() {
    // Update sender and receiver information
    $("#recName").text(destname);
    $("#recSuburb").text(destSuburb);
    $("#recPostcode").text(destPostcode);

    $("#senderName").text(senderName);
    $("#senderSuburb").text(senderSuburb);
    $("#senderPostcode").text(senderPostcode);

    // Update barcode table
    $("#barcodeTable").append('<tbody>');
    for (var i = 0; i < items.length; i++) {

        var row = '<tr><td class="text-center">' + items[i].itemNumber + '</td>';
        row += '<td class="text-center">' + items[i].description + '</td>';
        row += '<td class="text-center">' + items[i].itemLoc + '</td>';
        row += '<td>' + items[i].lastScan + '</td>';
        row += '</tr>';
        $("#barcodeTable").append(row);
    }
    $("#barcodeTable").append('</tbody>');
    $("#errorMessage").hide();
}

// When a row of the table is clicked, render barcode
function enableBarcodeGeneration() {
    $('.table > tbody > tr').click(function() {
        if (this.rowIndex != 0) {
            console.log('Creating barcode for \'' + this.cells[0].innerHTML + '\'');
            barcodeID = this.cells[0].innerHTML;
            var barcodeType = 'code128';
            if (barcodeID.charAt(0) == 0 && barcodeID.charAt(1) == 0) {
                barcodeType = 'sscc18';
                barcodeID = "(00)" + barcodeID.substring(2, barcodeID.length);
            }
            render(barcodeID, barcodeType);
			$('#content').css({'visibility':'visible'});
            $("#content").show();
        }
    });
}


// When Track button is clicked, fetch data using Tolls public Track and Trace
$("#photoTrackButton").click(function() {
    var list = document.getElementById("imageList").getElementsByTagName("h4");
    var conToSearch = list[0].innerHTML;
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    var url = "https://m.tollgroup.com/mobile/trackandtrace/b2c?t=generic&source=mobile&v=2&Action=SearchConnotesRequest&Connote=" + conToSearch;
    console.log(url);
    oReq.open("GET", url);
    oReq.send();
    console.log('loading con data.');
    $("#photoTrackButton").text('Fetching data');
    $("#photoTrackButton").attr("disabled", true);
});



function reqListener() {
    $("#barcodeTable > tbody").empty();
    $('#photoTrackButton').text('Track Consignment');
    $("#photoTrackButton").removeAttr("disabled");

    try {
        var reply = this.responseText;
        if (reply == '') {
			$('#errorMessage').css({'visibility':'visible'});
            $("#errorMessage").show();
            $("#errorMessage").html('<span class="glyphicon glyphicon-remove"></span> No consignment or item number exists.');
            throw new Error('No consignment or item number exists.');
        }
        //console.log('reply from server: ' + reply);
        var validJSON = JSON.stringify(jsonlint.parse(reply), null, "  ");
        console.log(validJSON);
        var parsedJSON = JSON.parse(validJSON);
        //console.log(parsedJSON);

        // check for valid con number input
        //if (parsedJSON['type'] != 'errors') {

        var businessUnitId = parsedJSON['trackeableEntities']['trackeableEntity']['0']['businessUnit']['id'];
        if (businessUnitId != 'IPEC') {
			$('#errorMessage').css({'visibility':'visible'});
            $("#errorMessage").show();
            $("#errorMessage").html('<span class="glyphicon glyphicon-remove"></span> Consignment is not being sent through TOLL IPEC, not supported.');
            throw new Error('Consignment is not being sent through TOLL IPEC, not supported.');
        }

        // Get information about sender and receiver
        var receiver = parsedJSON['trackeableEntities']['trackeableEntity']['0']['receiver'];
        itemCount = parsedJSON['trackeableEntities']['trackeableEntity']['0']['numItems'];
        destSuburb = receiver['suburb'];
        destPostcode = receiver['postcode'];
        destAddress = receiver['address1'];
        destname = receiver['name'];

        var sender = parsedJSON['trackeableEntities']['trackeableEntity']['0']['sender'];
        senderSuburb = sender['suburb'];
        senderPostcode = sender['postcode'];
        senderAddress = sender['address1'];
        senderName = sender['name'];

        var eventTime;
        var eventDesc;
        var eventLoc;
        var attributeCount;
        var attributeName;
        var attributeLabel;
        var currItem;

        // find out how many events the con has than loop through them and find items
        var eventCount = parsedJSON['trackeableEntities']['trackeableEntity']['0']['events']['trackeableEntityEventCount'];
        for (var i = eventCount - 1; i >= 0; i--) {
            var currEvent = parsedJSON['trackeableEntities']['trackeableEntity']['0']['events']['trackeableEntityEvent'][i];
            eventTime = currEvent['dateTime'];
            eventLoc = currEvent['location'];
            eventDesc = currEvent['description'];
            //console.log(eventDesc);

            // if event has attributes, parse them
            var attributes = parsedJSON['trackeableEntities']['trackeableEntity']['0']['events']['trackeableEntityEvent'][i]['attributes'];
            if (attributes != undefined) {
                attributeCount = attributes['attributeCount'];
                for (var f = attributeCount - 1; f >= 0; f--) {
                    var currAttribute = attributes['attribute'][f];
                    attributeName = currAttribute['name'];

                    // If the current attribute is ITEM_NUMBER then an item has been found
                    if (attributeName == 'ITEM_NUMBER') {
                        attributeLabel = currAttribute['label']; // contains an item number

                        // If item doesnt already exist, create it and insert current event data then add to array of items
                        // if item already exists, get it and update it
                        if (doesItemAlreadyExist(attributeLabel)) {
                            currItem = getItemByNumber(attributeLabel);
                        } else {
                            currItem = new Item(attributeLabel);
                            items.push(currItem);
                        }
                        // !!!! going to set attribute time instead of event time, change if not correct
                        currItem.lastScan = currAttribute['value'];
                        currItem.description = eventDesc;
                        currItem.itemLoc = eventLoc;
                    }
                }
            }
        }
        //} else {
        //	console.log("Unable to get con, probably invalid con number entered");
        //}
        updateTable();
        enableBarcodeGeneration();
		$('#barcodeTable').css({'visibility':'visible'});
        $("#barcodeTable").show();
		$('#senderTable').css({'visibility':'visible'});
        $("#senderTable").show();
        $("#itemCount").text(itemCount + ' item(s) found.');
		$('#itemCount').css({'visibility':'visible'});
        $("#itemCount").show();
        items.length = 0; // reset list now we no longer need it
    } catch (err) {
        console.log('Error: ' + err.message);
    } finally {
        if ($('#errorMessage').is(":visible")) {
            $("#barcodeTable").hide();
            $("#senderTable").hide();
            $("#itemCount").hide();
            $("#content").hide();

        }
    }
}

// Return an item from collection if imported itemNumber matches
function getItemByNumber(itemNumber) {
    var test = 0;
    var foundItem;
    for (var i = 0; i < items.length; i++) {
        if (items[i].itemNumber == itemNumber) {
            foundItem = items[i];
            test++;
        }
    }
    return foundItem;
}

// Check to see if an item exists using an itemNumber
function doesItemAlreadyExist(itemNumber) {
    //alert('does ' + itemNumber + ' exist?')
    var result = false;
    for (var i = 0; i < items.length; i++) {
        if (items[i].itemNumber == itemNumber) {
            result = true;
        }
    }
    return result;
}

// test by printing contents of items
console.log('--------------');
console.log('item count: ' + items.length);
for (var i = 0; i < items.length; i++) {
    console.log('--------------');
    console.log('item ID: ' + items[i].itemNumber);
    console.log('item description: ' + items[i].description);
    console.log('item location: ' + items[i].itemLoc);
    console.log('item last scan: ' + items[i].lastScan);
}