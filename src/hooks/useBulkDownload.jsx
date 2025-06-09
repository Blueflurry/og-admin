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
            console.log("🔄 Starting download process...");
            setDownloading(true);

            // Call the fetch function with the provided parameters
            console.log("📡 Calling fetch function...");
            const response = await fetchFunction();
            console.log("📡 API Response:", response);

            if (!response || !response.data) {
                console.error("❌ No data received from server");
                throw new Error("No data received from server");
            }

            // Extract the data array
            let dataArray = [];
            if (response.data.docs) {
                dataArray = response.data.docs;
                console.log(
                    "📄 Found docs array with",
                    dataArray.length,
                    "items"
                );
            } else if (Array.isArray(response.data)) {
                dataArray = response.data;
                console.log(
                    "📄 Found direct array with",
                    dataArray.length,
                    "items"
                );
            } else {
                console.error("❌ Invalid data format:", response.data);
                throw new Error("Invalid data format received");
            }

            // if (dataArray.length === 0) {
            //     console.warn("⚠️ No data found to download");
            //     message.warning("No data found to download");
            //     return;
            // }

            // Format the data using the provided formatter
            console.log("🔄 Formatting data...");
            const formattedData = dataFormatter(dataArray);
            console.log("✅ Formatted data sample:", formattedData.slice(0, 2)); // Log first 2 items

            // Convert to CSV using Papa Parse
            console.log("🔄 Converting to CSV...");
            const csv = Papa.unparse(formattedData, {
                header: true,
                skipEmptyLines: true,
            });
            console.log("✅ CSV generated, length:", csv.length);

            // Create and trigger download
            console.log("🔄 Creating download...");
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

                console.log("✅ Download triggered successfully");
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
            console.error("❌ Download error:", error);
            console.error("❌ Error stack:", error.stack);

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
            console.log("🔄 Cleaning up...");
            setDownloading(false);
        }
    };

    return { downloadCSV, downloading };
};
