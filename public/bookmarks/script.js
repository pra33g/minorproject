/*jshint esversion: 8 */
$('#form_bookmark').submit(
    function( e ) {
        // console.log(e);
        $.ajax( {
            url: '/bookmark',
            type: 'POST',
            data: new FormData( this ),
            processData: false,
            contentType: false,
            dataType: "json",
            success: function(result, status, jqXHR){
                console.log(result, status);
                //$("#div1").html(str);
            }
        } );
        e.preventDefault();
    } 
);