// barcodeRender.js
// 28/10/2016
// desc: interface with bwipp/bwijp to render barcode on canvas.
function render(barcodeID, barcodeType) {
    var elt = symdesc[$('#symbol').val()];
    text = barcodeID;

    //scaling factors.
    var scaleX = 2;
    var scaleY = 2;

    // Link in the freetype module and how to render fonts.
    var bw = new BWIPJS(Module, true); //monochrome is true

    var canvas = document.getElementById('canvas');
    canvas.height = 1;
    canvas.width = 1;

    // BWIPP does not extend the background color into the
    // human readable text.  Fix that in the bitmap interface.
    bw.bitmap(new Bitmap);

    // Set the scaling factors
    bw.scale(scaleX, scaleY);
    var opts = 'includetext';
    // Render the bar code
    try {
        // Create a new BWIPP instance for each
        BWIPP()(bw, barcodeType, text, 'includetext'); // change barcodeType to elt.sym to get option rather than hardcode
    } catch (e) {
        // Watch for BWIPP generated raiseerror's.
        var msg = '' + e;
        if (msg.indexOf("bwipp.") >= 0) {
            $('#output').text(msg);
        } else if (e.stack) {
            $('#output').text(e.stack);
        } else {
            $('#output').text(e);
        }
        return;
    }

    var rotation = 'N'; // Can be 'N' 'S' 'E' or 'W' to change rotation
    bw.bitmap().show(canvas, rotation);
}