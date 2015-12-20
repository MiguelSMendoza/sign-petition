'use strict';
$(document).ready(function() {
		var host = window.location.hostname;
	    var adminUrl = '//'+host+':3000/Sign/';
	    $('#formSign').validator().submit(function(event) {
		    if (!event.isDefaultPrevented()) {
	        event.preventDefault();
            var str = $('#formSign').serialize();
            $.ajax({
                    url:adminUrl,
                    type:'POST',
                    data:'action=sign_sendform&'+str,
                    success:function(data) {
                        if(data.errorcode === 0) {
                            $('#info').modal('show');
	                        $('#formSign').css({ 'display': 'none'});
                        }
                        else {
	                        $('#formSign').append('<div class="alert alert-danger fade in" id="errorDiv"><a href="#" class="close" data-dismiss="alert">&times;</a><strong><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span></strong>&nbsp;'+data.error+'</div>');                        
                        }
                    }
                });
             }
            return false;
	    });

	}); 