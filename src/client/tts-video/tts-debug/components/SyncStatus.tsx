import React from "react";

export const SyncStatus: React.FC<{ isSynced: boolean }> = ({ isSynced }) => (
  <div
    style={{
      position: "absolute",
      top: 50,
      left: 50,
      fontSize: 24,
      fontWeight: "bold",
      color: isSynced ? "green" : "red",
      zIndex: 1000,
    }}
  >
    Sync: {isSynced ? "Active" : "Fallback (Linear) - Try restarting server"}
  </div>
);
