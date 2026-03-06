<kbd>🏠 **Back to Home:**</kbd> [Return to Main README](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/README.md)

# 🔧 Troubleshooting & Known Issues

Welcome to the ClinicOS troubleshooting guide. Cloud-native infrastructure can be complex, and errors are a normal part of the engineering process. 

This document outlines the most common roadblocks you might encounter while spinning up this GitOps pipeline, categorized by the system components.



## 🟢 1. Kubernetes & Minikube Infrastructure

### Issue 1.1: Pods crashing with `OOMKilled` or cluster freezing.
* **Symptom:** Minikube becomes unresponsive, or running `kubectl get pods` shows a status of `OOMKilled` (Out Of Memory).
* **Root Cause:** Enterprise tools like Istio and ArgoCD are resource-intensive. The default Minikube allocation (usually 2GB of RAM) is insufficient to run the Service Mesh and the GitOps controller simultaneously.
* **The Fix:** Destroy the current cluster and provision a new one with extended memory.

```bash
  minikube delete
  minikube start --memory=6144 --cpus=4
```


## 🐙 2. ArgoCD & GitOps Synchronization

### Issue 2.1: ArgoCD Installation fails with "Too long: may not be more than 262144 bytes".

* **Symptom:** When running the initial `kubectl apply` for ArgoCD, the terminal outputs an error regarding the `applicationsets.argoproj.io` Custom Resource Definition (CRD).
* **Root Cause:** By default, `kubectl apply` saves a copy of the configuration in a hidden text label (client-side annotation). The ArgoCD configuration file is so massive that it exceeds Kubernetes' hard size limit for annotations.
* **The Fix:** Shift the processing burden to the cluster's API using Server-Side Apply.

```
kubectl apply -n argocd -f [https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml](https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml) --server-side
```



### Issue 2.2: "Apply failed with 1 conflict: conflict with kubectl-client-side-apply"

* **Symptom:** When attempting the Server-Side Apply fix above, Kubernetes halts the deployment due to a field ownership conflict.
* **Root Cause:** Kubernetes detects that two different state managers (the client and the server) are trying to control the same configuration fields and pauses to prevent accidental overwrites.
* **The Fix:** Force the API to transfer ownership to the server-side manager.
  
```bash
kubectl apply -n argocd -f [https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml](https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml) --server-side --force-conflicts
```



### Issue 2.3: Code pushed to GitHub is not appearing in the cluster.

* **Symptom:** You updated `deployment-v2.yaml` and pushed it to GitHub, but the ArgoCD dashboard is not showing the changes.
* **Root Cause:** ArgoCD polls the repository every 3 minutes. It is not instantaneous unless a webhook is configured.
* **The Fix:** 1. Wait 3 minutes.
2. Or, open the ArgoCD UI, click on your `clinicos-dashboard` application, and click the **SYNC** button to force an immediate manual reconciliation.


## 🕸️ 3. Istio Service Mesh

### Issue 3.1: Istio download script fails or hangs (Windows / Git Bash).

* **Symptom:** Running `curl -L https://istio.io/downloadIstio | sh -` returns a 404 error, "Unable to download Istio", or silently fails.
* **Root Cause:** The official shell script relies on Linux/macOS utilities (like `unzip`) that are often missing or behave differently in Windows Git Bash environments. It also occasionally struggles to find the latest edge-release binaries for Windows.
* **The Fix:** Bypass the script entirely.
1. Download the latest stable `.zip` release directly from the [Istio GitHub Releases page](https://github.com/istio/istio/releases).
2. Extract it locally into your project folder.
3. Navigate into the folder and link it to your PATH: `export PATH=$PWD/bin:$PATH`.



### Issue 3.2: Pods are showing `1/1` READY instead of `2/2`.

* **Symptom:** Running `kubectl get pods` shows your application pods running, but they only have one container. The Istio Envoy proxy is missing.
* **Root Cause:** Istio only injects proxies into namespaces that have been explicitly labeled, and it only does so *when the pod is created*. If the pods existed before Istio was installed, they will not have the proxy.
* **The Fix:** Label the namespace and gracefully restart the deployments to trigger the injection.
  
```bash
kubectl label namespace default istio-injection=enabled
kubectl rollout restart deployment clinicos-v1 clinicos-v2
```




## 🌐 4. Networking & Access

### Issue 4.1: "Connection Refused" or "Site cannot be reached" in the browser.

* **Symptom:** Navigating to `http://localhost:8080` (ArgoCD) or `http://localhost:8081` (ClinicOS) fails.
* **Root Cause:** Because Minikube runs inside a virtual machine, its internal IP addresses are not exposed to your host machine by default. The secure tunnel has collapsed or was never started.
* **The Fix:** Re-establish the port-forwarding tunnels. These commands will "hang" your terminal, which means they are working. You will need a separate terminal window for each tunnel.
* **For ArgoCD:** `kubectl port-forward svc/argocd-server -n argocd 8080:443`
* **For ClinicOS:** `kubectl port-forward svc/clinicos-service 8081:80`



## 📂 5. Version Control & Git

### Issue 5.1: `git status` shows thousands of untracked files or `git push` takes forever.

* **Symptom:** Your repository has become massively bloated, usually right after installing Istio.
* **Root Cause:** You accidentally downloaded the heavy Istio binary folder (`istio-1.x.x/`) or zip archive into your repository and Git is trying to track hundreds of megabytes of compiled executable files.
* **The Fix:** Add strict rules to your `.gitignore` file to permanently blind Git to these binaries.
1. Open `.gitignore` in your root directory.
2. Add the following lines: <br>
```text
*.zip
istio-*/
```


3. If you accidentally already committed them, you must remove them from the cache: `git rm -r --cached istio-*/` before committing the `.gitignore` update.


<kbd>🏠 **Back to Home:**</kbd> [Return to Main README](https://github.com/Indra1806/gitops-canary-pipeline/blob/main/README.md)