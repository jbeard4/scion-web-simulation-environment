$(document).ready(function(){
    var scion = require('scion');

    var scxmlContent = $('#scxmlContent'),
        scxmlLoadInitControls = $('#scxmlLoadInitControls'),
        loadScxmlFromField = $('#loadScxmlFromField'),
        initScxmlButton = $('#initScxmlButton'),
        scxmlTrace = $('#scxmlTrace'),
        scxmlSimulationControls = $('#scxmlSimulationControls'),
        eventNameField = $('#eventNameField'),
        vizButton = $("#vizButton");

    $(document.documentElement).keypress(function(e){
        if(e.charCode === 10 && e.ctrlKey){
            visualize();
        }
    });

    var codeMirror = CodeMirror.fromTextArea(scxmlContent[0], window.location.search.match(/keyMap=vim/) ? {keyMap:'vim'} : undefined);

    var scxmlInstance, svg;

    var listener = {
        onEntry : function(stateId){
            console.log('onentry',stateId);
            d3.select(document.getElementById(stateId)).classed('highlighted',true);
        },
        onExit : function(stateId){
            console.log('onexit',stateId);
            d3.select(document.getElementById(stateId)).classed('highlighted',false);
        }
    };

    //add behaviour
    scxmlLoadInitControls.submit(function(e){
        e.preventDefault();
        var pathToScxml = loadScxmlFromField.val();
        //AJAX GET it
        //TODO: error handling
        $.get(pathToScxml,function(scxmlText){
            codeMirror.setValue(scxmlText);
        },"text");
    });

    function visualize(e){
        try {
            var doc = (new DOMParser()).parseFromString(codeMirror.getValue(),"application/xml");
            scxmlTrace.empty();
            svg = ScxmlViz(scxmlTrace[0],doc,scxmlTrace.width(),scxmlTrace.height());
        }catch(err){
            console.error(err);
        }
    }

    vizButton.click(visualize);

    initScxmlButton.click(function(){
        //read the content and load it up
        scion.documentStringToModel(codeMirror.getValue(),function(err,model){
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

        eventNameField.val(''); 
    }); 

    //try auto-visualizing every 1s

});
