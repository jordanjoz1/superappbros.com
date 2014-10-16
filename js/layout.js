// load jquery elements when the dom is ready
$(function() {

    // Stylize buttons
    $( ".style_button" ).button();
    $( ".titlebar_option" ).button();
    $( "#intro_continue" ).button();
    $( "#check" ).button();
    $( "#multi_select_controls" ).buttonset();
    $( "#calendar_controls" ).buttonset();
    $( "#calculator_controls" ).buttonset();
    
    // Stylize accordion
    $( "#accordion" ).accordion();    
    
    // Hover states on the static widgets
    $( "#info_button" ).hover(
        function() {
            $( this ).addClass( "ui-state-hover" );
        },
        function() {
            $( this ).removeClass( "ui-state-hover" );
        }
    );
    
    // More info dialog
    $( "#info_dialog" ).dialog({
        autoOpen: false,
        width: 400,
        buttons: [
            {
                text: "Ok",
                click: function() {
                    $( this ).dialog( "close" );
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        ]
    });
    
    // Calendar dialog
    $( "#calendar_dialog" ).dialog({
        autoOpen: false,
        width: 1000,
        buttons: [
            {
                text: "Ok",
                click: function() {
                    $( this ).dialog( "close" );
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        ]
    });
    
    // Calculator dialog
    $( "#calculator_dialog" ).dialog({
        autoOpen: false,
        width: 600,
        buttons: [
            {
                text: "Ok",
                click: function() {
                    updateIndicators();
                    $( this ).dialog( "close" );
                }
            },
            {
                text: "Cancel",
                click: function() {
                    $( this ).dialog( "close" );
                }
            }
        ]
    });
    
    // Link to open the info dialog
    $( "#info-dialog-link" ).click(function( event ) {
        $( "#info_dialog" ).dialog( "open" );
        event.preventDefault();
    });
    
    // Link to open the calendar dialog
    $( "#calendar-dialog-link" ).click(function( event ) {
        $( "#calendar_dialog" ).dialog( "open" );
        event.preventDefault();
    });
    
    // Link to open the playstyle calculator dialog
    $( "#calculator-dialog-link" ).click(function( event ) {
        $( "#calculator_dialog" ).dialog( "open" );
        event.preventDefault();
    });    
});

function intro_continue() {
    $("#instructions_overlay").hide();
    $("#intro_dialog_containter").remove();
    introJs().start();
}

function toggle_style(button) {
    $("#" + button.id);
}

function toggleSelectType() {
    multiSelect = !multiSelect;
}