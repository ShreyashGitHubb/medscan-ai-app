# Model Conversion Instructions

The model conversion process requires installing `tensorflowjs`, which includes large dependencies (TensorFlow ~300MB). 
Due to network constraints, the automatic conversion was skipped. 

To convert the models manually when you have a better connection:

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Install the required Python packages:
    ```bash
    pip install tensorflowjs onnx torch torchvision
    ```

3.  Run the conversion script:
    ```bash
    python convert_models.py
    ```

4.  Verify that `mobile-app/assets/models` contains the converted `.json` and `.bin` files.

5.  Update `mobile-app/App.js` to uncomment the real model loading logic and remove the mock logic.
