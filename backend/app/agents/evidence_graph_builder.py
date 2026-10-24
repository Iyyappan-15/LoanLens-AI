"""
LoanLens AI - Evidence Graph Data Builder
Constructs a Directed Acyclic Graph (DAG) linking:
Documents -> Key Transactions -> Discrepancies -> Findings -> CAM Sections.
Outputs a clean node/edge structure ready for React Flow / Cytoscape.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.app.schemas.shared import FindingSchema

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # 'DOCUMENT', 'TRANSACTION', 'METRIC', 'FINDING', 'CAM_SECTION'
    category: Optional[str] = None
    severity: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    relationship: str  # 'EXTRACTED_FROM', 'EVIDENCED_BY', 'IMPACTS', 'INCLUDED_IN'

class EvidenceGraphResponse(BaseModel):
    case_id: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class EvidenceGraphBuilder:
    """Builds interactive visual graph representation of underwriting evidence."""

    @staticmethod
    def build_graph(
        case_id: str,
        documents: List[Dict[str, Any]],
        findings: List[FindingSchema],
        cam_sections: Optional[List[str]] = None,
    ) -> EvidenceGraphResponse:
        nodes: List[GraphNode] = []
        edges: List[GraphEdge] = []
        edge_counter = 1

        # 1. Add Document Nodes
        doc_node_ids = set()
        for doc in documents:
            doc_id = doc.get("document_id", "DOC-UNKNOWN")
            doc_node_ids.add(doc_id)
            nodes.append(
                GraphNode(
                    id=doc_id,
                    label=doc.get("document_name", doc_id),
                    type="DOCUMENT",
                    category=doc.get("type", "FINANCIAL_RECORD"),
                    metadata={"status": "VERIFIED"},
                )
            )

        # 2. Add Finding Nodes and Connect to Evidence
        for finding in findings:
            finding_node_id = finding.id
            nodes.append(
                GraphNode(
                    id=finding_node_id,
                    label=finding.title,
                    type="FINDING",
                    category=finding.category,
                    severity=finding.severity.value if hasattr(finding.severity, "value") else str(finding.severity),
                    metadata={
                        "is_verified": finding.is_verified,
                        "impact": finding.impact_assessment,
                    },
                )
            )

            # Connect finding to evidence citations
            for ref in finding.evidence:
                doc_id = ref.document_id
                
                # If evidence references a specific transaction, add a transaction node
                if ref.transaction_id:
                    txn_node_id = f"TXN-{ref.transaction_id}"
                    if not any(n.id == txn_node_id for n in nodes):
                        nodes.append(
                            GraphNode(
                                id=txn_node_id,
                                label=f"Txn: {ref.transaction_id}",
                                type="TRANSACTION",
                                metadata={"snippet": ref.extracted_text_snippet},
                            )
                        )
                        # Edge: Document -> Transaction
                        if doc_id in doc_node_ids:
                            edges.append(
                                GraphEdge(
                                    id=f"edge-{edge_counter}",
                                    source=doc_id,
                                    target=txn_node_id,
                                    label="contains",
                                    relationship="EXTRACTED_FROM",
                                )
                            )
                            edge_counter += 1

                    # Edge: Transaction -> Finding
                    edges.append(
                        GraphEdge(
                            id=f"edge-{edge_counter}",
                            source=txn_node_id,
                            target=finding_node_id,
                            label="triggers",
                            relationship="EVIDENCED_BY",
                        )
                    )
                    edge_counter += 1

                else:
                    # Edge directly from Document -> Finding
                    if doc_id in doc_node_ids:
                        edges.append(
                            GraphEdge(
                                id=f"edge-{edge_counter}",
                                source=doc_id,
                                target=finding_node_id,
                                label="evidences",
                                relationship="EVIDENCED_BY",
                            )
                        )
                        edge_counter += 1

            # 3. Connect Finding to CAM section if defined
            cam_section_id = f"CAM-SECTION-RISK-ASSESSMENT"
            if not any(n.id == cam_section_id for n in nodes):
                nodes.append(
                    GraphNode(
                        id=cam_section_id,
                        label="CAM: Risk Appraisal & Findings",
                        type="CAM_SECTION",
                        metadata={"report": "Credit Appraisal Memo"},
                    )
                )

            edges.append(
                GraphEdge(
                    id=f"edge-{edge_counter}",
                    source=finding_node_id,
                    target=cam_section_id,
                    label="informs",
                    relationship="INCLUDED_IN",
                )
            )
            edge_counter += 1

        return EvidenceGraphResponse(
            case_id=case_id,
            nodes=nodes,
            edges=edges,
        )
