"use client";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirebaseApp, db } from "@studiqa/firebase-config";
import type { MindMap } from "@studiqa/types";

export default function MindMapViewerPage({ params }: { params: { id: string } }) {
  const [map, setMap] = useState<MindMap | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    const uid = getAuth(getFirebaseApp()).currentUser?.uid;
    if (!uid) return;
    return onSnapshot(doc(db(), "users", uid, "mindMaps", params.id), (snap) => {
      if (snap.exists()) setMap({ id: snap.id, ...(snap.data() as Omit<MindMap, "id">) });
    });
  }, [params.id]);

  if (!map) return <main style={{ padding: 48 }}>Loading mind map…</main>;

  const selectedNode = map.nodes.find((n) => n.id === selectedNodeId);

  return (
    <main style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1, position: "relative", background: "#0B0D10" }}>
        <svg viewBox="0 0 800 600" style={{ width: "100%", height: "100%" }}>
          {map.nodes.map(
            (node) =>
              node.parentId && (
                <line
                  key={`edge-${node.id}`}
                  x1={map.nodes.find((n) => n.id === node.parentId)?.x ?? 0}
                  y1={map.nodes.find((n) => n.id === node.parentId)?.y ?? 0}
                  x2={node.x}
                  y2={node.y}
                  stroke="#3A3F47"
                />
              )
          )}
          {map.nodes.map((node) => (
            <g key={node.id} onClick={() => setSelectedNodeId(node.id)} style={{ cursor: "pointer" }}>
              <circle cx={node.x} cy={node.y} r={28} fill={node.colorTag ?? "#5B5EF4"} />
              <text x={node.x} y={node.y + 44} textAnchor="middle" fill="#EDEDED" fontSize={12}>
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {selectedNode && (
        <aside style={{ width: 320, padding: 24, background: "#15181C", color: "#EDEDED" }}>
          <h2>{selectedNode.label}</h2>
          <p>{selectedNode.explanation ?? "No explanation generated yet."}</p>
          <button>Turn this into a quiz</button>
        </aside>
      )}
    </main>
  );
}
