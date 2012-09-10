$(document).ready(function(){
    var scion = require('scion');

    var scxmlContent = $('#scxmlContent'),
        scxmlLoadInitControls = $('#scxmlLoadInitControls'),
        loadScxmlFromField = $('#loadScxmlFromField'),
        initScxmlButton = $('#initScxmlButton'),
        scxmlTrace = $('#scxmlTrace'),
        scxmlSimulationControls = $('#scxmlSimulationControls'),
        eventNameField = $('#eventNameField'),
        logOnentryCheckbox = $('#logOnentry')[0],
        logOnexitCheckbox = $('#logOnexit')[0];

    var scxmlInstance;

    function trace(txt){
        var p = document.createElement('p');
        p.setAttribute('style','display:none');
        $(p).text(txt);
        scxmlTrace.append(p);
        $(p).fadeIn();
        scxmlTrace.scrollTop(scxmlTrace.scrollTop()+1000);
    }

    var listener = {
        onEntry : function(stateId){
            if(logOnentryCheckbox.checked) trace('entering ' + stateId);
        },
        onExit : function(stateId){
            if(logOnexitCheckbox.checked) trace('exiting ' + stateId);
        }
    };

    //add behaviour
    scxmlLoadInitControls.submit(function(e){
        e.preventDefault();
        var pathToScxml = loadScxmlFromField.val();
        //AJAX GET it
        //TODO: error handling
        $.get(pathToScxml,function(scxmlText){
            scxmlContent.val(scxmlText);
        },"text");
    });

    initScxmlButton.click(function(){
        //read the content and load it up
        scion.documentStringToModel(scxmlContent.val(),function(err,model){
            if(err){ 
                alert(err.message);
                throw err;
            }

            //clean up othe rinstance, if it exists
            if(scxmlInstance){
                scxmlInstance.unregisterListener(listener);
            } 

            scxmlInstance = new scion.SCXML(model);
            scxmlInstance.registerListener(listener); 

            var conf = scxmlInstance.start();
            
            trace('started new scxml instance >> ' + JSON.stringify(conf));
        });
    });

    scxmlSimulationControls.submit(function(e){
        e.preventDefault();

        if(!scxmlInstance){
            var err = new Error('SCXML interpreter not loaded');
            alert(err.message);
            throw err;
        }

        var eventName = eventNameField.val(); 
        var conf = scxmlInstance.gen(eventName); 

        trace(eventName + ' >> ' + JSON.stringify(conf));

        eventNameField.val(''); 
    }); 
});
