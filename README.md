## How to Run the Project

1.  **Install Dependencies:**
    Open a terminal in the project's root folder and run the command:

    ```bash
    npm install
    ```

2.  **Start the Development Server:**
    After the dependencies are installed, start the project with the command:

    ```bash
    npm run dev
    ```

3.  **Open the Application:**
    Navigate to the address shown in the terminal (usually `http://localhost:5173`) in your browser.

## How the Stream and Vega Spec are Processed

The data processing and visualization workflow is as follows:

1.  **File Upload:** The user clicks the "Play" button and selects a file in `.jsonl` format.

2.  **Stream Processing:**

    - After a file is selected, the custom `useStream` hook begins to read the file in chunks.
    - The file's content is gradually read and displayed in the "terminal" window on the left side of the screen. This allows for handling large files without loading them entirely into memory.

3.  **Parsing the Vega-Lite Spec:**

    - As text arrives from the stream, the `vegaParser` utility attempts to find and extract a valid JSON object that conforms to the Vega-Lite specification.
    - The parser looks for a JSON block wrapped in `json ... `. Once a valid JSON object is found, it is extracted for further processing.

4.  **Rendering the Visualization:**
    - When the Vega-Lite specification is successfully extracted, the `App` component passes it to the `vega-embed` library.
    - `vega-embed` then renders the chart on the right side of the screen. The data for the chart (`CHART_DATA`) is hardcoded in this example, but the specification that defines _how_ to display it comes from the stream.

This approach allows for real-time receiving and visualization of data, which is ideal for monitoring logs, analyzing data from an LLM, or any other streaming data source.
