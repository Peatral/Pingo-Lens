// @input Asset.CloudStorageModule cloudStorageModule

const cloudStorageOptions = CloudStorageOptions.create();
const writeOptions = CloudStorageWriteOptions.create();
writeOptions.scope = StorageScope.User;
const readOptions = CloudStorageReadOptions.create();
readOptions.scope = StorageScope.User;
const listOptions = CloudStorageListOptions.create();
listOptions.scope = StorageScope.User;

if (!script.cloudStorageModule) {
    return;
}

script.cloudStorageModule.getCloudStore(cloudStorageOptions, onCloudStoreReady, onError);

    
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
                    errorCallback
                );
            }
        }, 
        errorCallback
    );
}

function errorCallback(code, message) {
    print('Error: ' + code + ' ' + message);
}

