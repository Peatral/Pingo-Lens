// @input Component.Text display
// @input Component.AnimationMixer animations
// @ui {"widget":"group_start", "label":"Animation Layers"}
// @input string animationLayerAwake
// @input string animationLayerMouthOpen
// @input string animationLayerTap
// @ui {"widget":"group_end"}

// @input Component.Text errorMessages

// @input boolean enableCloud
// @input Asset.CloudStorageModule cloudStorageModule

// @typename StorageHandler
// @input StorageHandler storageHandler

var counter = 0;




const cloudStorageOptions = CloudStorageOptions.create();
const writeOptions = CloudStorageWriteOptions.create();
writeOptions.scope = StorageScope.User;
const readOptions = CloudStorageReadOptions.create();
readOptions.scope = StorageScope.User;
const listOptions = CloudStorageListOptions.create();
listOptions.scope = StorageScope.User;


if (script.enableCloud) {
    script.cloudStorageModule.getCloudStore(cloudStorageOptions, onCloudStoreReady, onError);
}
    
function onError(error) {
    script.errorMessages.text = 'Error: ' + error;
}

function onCloudStoreReady(store) {
    script.store = store;
    script.store.listValues(
        listOptions, 
        function onRetrieved(values, cursor) {
            if (values.indexOf("flips") != -1) {
                store.getValue(
                    "flips", 
                    readOptions, 
                    function onRetrieved(key, value) {
                        setCounter(value);
                    },
                    function onError(code, message) {
                        script.errorMessages.text = 'Error: ' + code + ' ' + message;
                        print('Error: ' + code + ' ' + message);
                    }
                );
            }
        }, 
        function onError(code, message) {
            script.errorMessages.text = 'Error: ' + code + ' ' + message;
            print('Error: ' + code + ' ' + message);
        }
    );
}





function tapEvent(eventData) {
    if (startAnimationLayer(script.animations, script.animationLayerTap)) {
        increaseCounter();
    }
}

function mouthOpenEvent(eventData) {
    startAnimationLayer(script.animations, script.animationLayerMouthOpen);
}

function increaseCounter() {
    setCounter(counter + 1);
    
    if (script.enableCloud) {
        script.store.setValue(
            "flips",
            counter,
            writeOptions,
            function onSuccess() {
            },
            function onError(code, message) {
                script.errorMessages.text = 'Error: ' + code + ' ' + message;
                print('Error: ' + code + ' ' + message);
            }
        );
    }
    
}

function startAnimationLayer(mixer, layerToStart) {
    var priority = [script.animationLayerTap, script.animationLayerMouthOpen];

    var layerNames = mixer.getAnimationLayerNames();

    for (var i = 0; i < layerNames.length; i++) {
        var layerName = layerNames[i];
        var layer = mixer.getLayer(layerName);

        if (layerName == layerToStart && layer.getTime() >= layer.getDuration()) {
            continue;
        }

        if (priority.indexOf(layerName) != -1 && layer.isPlaying()) {
            return false;
        }

        layer.stop();
        mixer.setWeight(layerName, 0.0);
    }
    
    mixer.setWeight(layerToStart, 1.0);
    mixer.start(layerToStart, 0, 1);

    return true;
}

function setCounter(value) {
    counter = value;
    script.display.text = "Flips: " + value;
}

script.createEvent("TapEvent").bind(tapEvent);
script.createEvent("MouthOpenedEvent").bind(mouthOpenEvent);

startAnimationLayer(script.animations, script.animationLayerAwake);