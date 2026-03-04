# 🛠️ Engineering Error Ledger & Troubleshooting

This document tracks technical roadblocks encountered during the development and deployment of the GitOps Canary Pipeline, along with their root causes and engineered resolutions.


## 🟢 Milestone 1: Containerization & Local Development

### Issue 1: Docker Build Context Failure
* **Error Trigger:** Executing `docker build -t clinicos:v1 .`
* **Log Output:** `ENOENT: no such file or directory, open '/app/package.json'`
* **Root Cause:** The `Dockerfile` was executed, but the Docker daemon could not locate `package.json` to resolve Node dependencies because the terminal was executing from the parent directory, or the `Dockerfile` was not adjacent to the package manifests.
* **Resolution:** Relocated the `Dockerfile` to the exact root of the React application (`src/`) and verified the build context (`.`) was correctly passed. Re-ran the build successfully.

### Issue 2: Missing Local Dev Dependencies
* **Error Trigger:** Executing `npm run dev`
* **Log Output:** `'vite' is not recognized as an internal or external command`
* **Root Cause:** Attempted to start the local Vite development server without first hydrating the local `node_modules` directory.
* **Resolution:** Executed `npm install` to download required binaries based on the `package.json` lock state. Additionally, created a `.gitignore` file mapping to `node_modules/` to ensure the 300MB+ dependency folder was not committed to the Git repository.



## 🔵 Milestone 2: Kubernetes & ArgoCD

### Issue 3: Kubernetes Field Ownership Conflict
* **Error Trigger:** Executing `kubectl apply ... --server-side` for ArgoCD CRDs.
* **Log Output:** `Apply failed with 1 conflict: conflict with "kubectl-client-side-apply"`
* **Root Cause:** A collision between Kubernetes state managers. The initial installation attempt used client-side apply, assigning ownership of configuration fields to the client. The subsequent server-side apply attempted to take ownership of those same fields, causing the Kubernetes API to pause the deployment to prevent accidental overwrites.
* **Resolution:** Appended the `--force-conflicts` flag to explicitly command the Kubernetes API to transfer ownership of all configurations to the server-side manager.



## 🟣 Milestone 3: Istio Service Mesh (Pending)

*(Errors related to Istio proxy injection, VirtualServices, and DestinationRule routing will be logged here).*



## 📝 Ledger Template for Future Use
```text
### Issue X: [Brief Description]
* **Error Trigger:** [What command or action caused it]
* **Log Output:** `[Snippet of the error log]`
* **Root Cause:** [Why did the system fail?]
* **Resolution:** [Exact steps or commands used to fix it]
