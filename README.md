# 🚀 Enterprise GitOps & Service Mesh Platform
<div align="right">

**Project:** Automated GitOps Release Platform with Istio Canary Routing  
**Domain:** Site Reliability Engineering (SRE), DevOps, Cloud-Native Architecture  
**Application:** ClinicOS (Stateless React Dashboard)  
</div>

<img width="1536" height="1024" alt="clinicosimage" src="https://github.com/user-attachments/assets/f17efd09-1789-480e-ac6f-8b0f93aa67df" />

---

<details>
<summary><h2>📊 Executive Summary</h2></summary>

This project demonstrates a production-grade Continuous Deployment (CD) pipeline utilizing **GitOps** principles and a **Service Mesh**. It solves the critical business problem of deployment downtime and the high risk associated with "big-bang" software releases. 

By integrating **ArgoCD** for declarative infrastructure synchronization and **Istio** for advanced network routing, this architecture allows new software versions to be safely tested in production on a fractional user base (10% Canary) before full promotion.

</details>


<details>
<summary><h2>🏗️ System Architecture & Traffic Flow</h2></summary>

The infrastructure operates on a strict pull-based GitOps methodology. The GitHub repository is the single source of truth for all application and infrastructure states.

```mermaid
graph TD
    A[Developer] -->|git push| B(GitHub Repository)
    
    subgraph "Kubernetes Cluster (Minikube)"
        C[ArgoCD Controller] -.->|watches & pulls| B
        
        subgraph "Istio Service Mesh"
            D[Istio Ingress Gateway / Service]
            E[VirtualService]
            
            D --> E
            E -->|90% Traffic| F(ClinicOS v1 Pods - Stable)
            E -->|10% Traffic| G(ClinicOS v2 Pods - Canary)
        end
        
        C -->|Reconciles State| F
        C -->|Reconciles State| G
        C -->|Configures Rules| E
    end
    
    User([End User]) -->|HTTP Request| D

```

</details>

<details>
<summary><h2>⚙️ Technology Stack</h2></summary>

| Domain | Technology | Implementation Details |
| --- | --- | --- |
| **Application** | React.js (Vite) | Stateless Single Page Application (ClinicOS). |
| **Containerization** | Docker | Multi-stage builds utilizing `nginx:alpine` for low-latency serving. |
| **Orchestration** | Kubernetes | Provisioned via Minikube (`6GB RAM`, `4 CPUs`). |
| **GitOps Controller** | ArgoCD | Automated, pull-based state reconciliation. |
| **Traffic Management** | Istio | Service mesh for telemetry, security, and weighted routing. |

</details>

<details>
<summary><h2>📂 Repository Structure</h2></summary>

```text
gitops-canary-pipeline/
├── docs/                       # Project Documentation
│   ├── ARCHITECTURE_RUNBOOK.md # Detailed execution steps and system architecture
│   ├── CHEATSHEET.md           # Daily commands, service URLs, and emergency reset protocols
│   ├── CMS_PROJECT_BLUEPRINT.DOCX # Original project design and requirements document
│   ├── EASY-INSTALL.md         # A methodical, step-by-step setup guide with prerequisites
│   ├── Error_Ledger.md         # Infrastructure conflict resolution logs
│   ├── QUICK-START.md          # For experienced engineers who just want to spin up the cluster
│   ├── SUMMARY.md              # The business case and high-level problem this solves
│   ├── THE_SRE_JOURNEY.md      # The engineering journal detailing the build process
│   └── TROUBLESHOOTING.md      # Known issues, K8s conflicts, and their engineered solutions
│
├── frontend/                   # ClinicOS React application source code
│   ├── public/                 # Public static assets
│   │   └── vite.png
│   ├── src/                    # React components and application logic
│   │   ├── assets/             # Images and static media
│   │   ├── App.css             # Component-level styling
│   │   ├── App.jsx             # Main application component
│   │   ├── helpers.js          # Utility functions and logic
│   │   ├── index.css           # Global application styles
│   │   ├── main.jsx            # Vite DOM mounting point
│   │   └── setupTests.js       # Test environment configuration
│   ├── .gitignore              # Ignored files for the frontend module
│   ├── Dockerfile              # Multi-stage build instructions for containerization
│   ├── eslint.config.js        # Linter configuration for code quality
│   ├── index.html              # Main HTML template
│   ├── package-lock.json       # Locked dependency versions
│   ├── package.json            # Node.js application dependencies and scripts
│   └── vite.config.js          # Vite bundler configuration
│
├── k8s/                        # Kubernetes Infrastructure as Code (IaC)
│   └── app/                    
│       ├── deployment-v1.yaml  # Stable Release Manifest (Teal UI)
│       ├── deployment-v2.yaml  # Canary Release Manifest (Purple UI)
│       ├── destination-rule.yaml # Istio Pod Categorization (Stable vs Canary subsets)
│       ├── service.yaml        # Internal Cluster Network Gateway
│       └── virtual-service.yaml  # Istio 90/10 Traffic Split Logic
│
├── .gitignore                  # Root ignore rules (blocks heavy Istio binaries)
└── README.md                   # Master Documentation & Navigation Hub

```

</details>

<details>
<summary><h2>📚 Documentation & Reading Path</h2></summary>

Welcome to the ClinicOS GitOps platform. 



 To fully understand the architecture, business value, and operational mechanics of this project, we recommend following this reading order:

**1. The Concepts & Architecture**

* 📖 [Executive Summary](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/docs/SUMMARY.md) - The business case and high-level problem this solves.
* 🧠 [The SRE Journey](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/docs/THE_SRE_JOURNEY.md) - The engineering journal detailing how this was built and the lessons learned.
* 🏗️ [Architecture Runbook](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/docs/CMS_Project_Blueprint.docx) - Deep dive into the declarative infrastructure and traffic flow.

**2. Setup & Installation**

* ⚡ [Quick Start Guide](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/docs/QUICK-START.md) - For experienced engineers who just want to spin up the cluster in 5 minutes.
* 🛠️ [Easy Install](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/docs/EASY-INSTALL.md) - A methodical, step-by-step setup guide with prerequisites.

**3. Day-to-Day Operations**

* 🚀 [Operations Cheatsheet](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/docs/CHEATSHEET.md) - Daily commands, service URLs, and emergency reset protocols.
* 🔧 [Troubleshooting & Error Ledger](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/docs/Error_Ledger.md) - Known issues, K8s conflicts, and their engineered solutions.

</details>

<details>
<summary><h2>🚀 Engineering Runbook (Execution Steps)</h2></summary>

### Phase 1: Application Containerization (Completed)

* Developed `ClinicOS`, a dynamic medical dashboard.
* Engineered a highly optimized, multi-stage `Dockerfile`.
* Packaged two distinct release candidates:
* **v1 (Stable):** Primary teal user interface.
* **v2 (Canary):** Secondary purple user interface for A/B testing.


* Images pushed to Docker Hub global registry.

### Phase 2: Kubernetes & GitOps Initialization

1. **Provision Infrastructure:**

```bash
minikube start --memory=6144 --cpus=4

```

2. **Install ArgoCD (Server-Side Apply to bypass CRD limits):**

```bash
kubectl create namespace argocd
kubectl apply -n argocd -f [https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml](https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml) --server-side --force-conflicts

```

### Phase 3: Service Mesh Injection

1. **Install Istio Control Plane:**

```bash
istioctl install --set profile=default -y

```

2. **Enable Proxy Injection & Restart Pods:**

```bash
kubectl label namespace default istio-injection=enabled
kubectl rollout restart deployment clinicos-v1 clinicos-v2

```

### Phase 4: Canary Deployment & Verification

1. **Apply GitOps Manifests:** Let ArgoCD sync the `k8s/app/` directory.
2. **Verify Traffic Split:** Access the application via a local port-forward. Refreshing the application will yield the `v1` interface 90% of the time, and the `v2` (purple) interface 10% of the time, validating the zero-downtime routing protocol.

</details>

<details>
<summary><h2>🛠️ Error Ledger & Troubleshooting</h2></summary>

View the <kbd>[Error Ledger](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/docs/Error_Ledger.md)</kbd> for detailed post-mortems on Kubernetes field ownership conflicts and infrastructure binary exclusion.

*Architected and maintained to enterprise SRE standards.*

</details>

<div>
<p>Give a Star</p>
</div>