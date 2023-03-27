// @input Component.Text flipText
// @input Component.Head[] heads
// @input Component.AnimationMixer[] animations
// @ui {"widget":"group_start", "label":"Animation Layers"}
// @input string animationLayerAwake
// @input string animationLayerMouthOpen
// @input string animationLayerTap
// @ui {"widget":"group_end"}

const KEY_FLIPS = "flips";

var persistentStorageSystem = global.persistentStorageSystem.store;
var counter = persistentStorageSystem.getFloat(KEY_FLIPS) || 0;

var faceCount = 0;

updateFlipText();


script.createEvent("TapEvent").bind(function() {
    for (var i = 0; i < Math.min(script.heads[0].getFacesCount(), script.animations.length); i++) {
        if (startAnimationLayer(script.animations[i], script.animationLayerTap)) {
            increaseCounter();
        }
    }
});

for (var i = 0; i < script.animations.length; i++) {
    var mouthOpen = script.createEvent("MouthOpenedEvent");
    mouthOpen.faceIndex = i;
    mouthOpen.bind(createClosure(i, function(faceIndex) {
        playMouthOpen(faceIndex);
    }));

    startAnimationLayer(script.animations[i], script.animationLayerAwake);
}

function createClosure(faceIndex, func) {
    return function() { 
        func(faceIndex);
    }
}

function playMouthOpen(faceIndex) {
    if (faceIndex >= script.animations.length || faceIndex < 0) {
        return;
    }
    
    startAnimationLayer(script.animations[faceIndex], script.animationLayerMouthOpen);
}

function updateFlipText() {
    script.flipText.text = "Flips: " + counter;
}

function setCounter(value) {
    counter = value;
    persistentStorageSystem.putFloat(KEY_FLIPS, counter);
    updateFlipText();
}

function increaseCounter() {
    setCounter(counter + 1);
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