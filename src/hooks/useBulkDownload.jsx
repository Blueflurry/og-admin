import { useState } from "react";
import { message, notification } from "antd";

import { CheckCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import Papa from "papaparse";

export const useBulkDownload = () => {
    const [downloading, setDownloading] = useState(false);

    const downloadCSV = async (
        fetchFunction,
        filename,
        dataFormatter,
        currentFilters = {},
        currentSort = ""
    ) => {
        try {
            setDownloading(true);

            // Call the fetch function with the provided parameters
            const response = await fetchFunction();

            if (!response || !response.data) {
                throw new Error("No data received from server");
            }

            // Extract the data array
            let dataArray = [];
            if (response.data.docs) {
                dataArray = response.data.docs;
            } else if (Array.isArray(response.data)) {
                dataArray = response.data;
            } else {
                throw new Error("Invalid data format received");
            }

            // Format the data using the provided formatter
            const formattedData = dataFormatter(dataArray);

            // Convert to CSV using Papa Parse
            const csv = Papa.unparse(formattedData, {
                header: true,
                skipEmptyLines: true,
            });

            // Create and trigger download
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = "hidden";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up the URL
                setTimeout(() => URL.revokeObjectURL(url), 100);
            } else {
                throw new Error("Browser does not support file downloads");
            }

            // Show enhanced success notification
            notification.success({
                message: "Download Completed!",
                description: (
                    <div>
                        <p>
                            <strong>File:</strong> {filename}
                        </p>
                        <p>
                            <strong>Records:</strong> {formattedData.length}
                        </p>
                        <p>Your file has been downloaded successfully.</p>
                    </div>
                ),
                icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
                duration: 4.5,
                placement: "topRight",
            });
        } catch (error) {
            // Show enhanced error notification
            notification.error({
                message: "Download Failed",
                description: (
                    <div>
                        <p>
                            <strong>Error:</strong> {error.message}
                        </p>
                        <p>
                            Please try again or contact support if the issue
                            persists.
                        </p>
                    </div>
                ),
                duration: 6,
                placement: "topRight",
            });
        } finally {
            setDownloading(false);
        }
    };

    return { downloadCSV, downloading };
};
