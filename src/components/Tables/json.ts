import * as BUI from "@thatopen/ui";
import * as WEBIFC from "web-ifc";
import * as OBC from "@thatopen/components";

const components = new OBC.Components();
components.init();

const exporter = components.get(OBC.IfcJsonExporter);
const webIfc = new WEBIFC.IfcAPI();
webIfc.SetWasmPath("https://unpkg.com/web-ifc@0.0.66/", true);
await webIfc.Init();

let modelID: number | null = null; // Variable global para almacenar el ID del modelo cargado

// Crear input para importar IFC
const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = ".ifc";
fileInput.style.display = "none";
document.body.appendChild(fileInput);

fileInput.addEventListener("change", async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const ifcData = await file.arrayBuffer();
    const ifcBuffer = new Uint8Array(ifcData);
    modelID = webIfc.OpenModel(ifcBuffer);
    console.log("IFC Model Loaded:", modelID);
  }
});

// Botón para abrir el input de carga de archivos
const importButton = BUI.Component.create<BUI.PanelSection>(() => {
  return BUI.html`
    <bim-button label="Import IFC" @click="${() => fileInput.click()}"></bim-button>
  `;
});

document.body.append(importButton);

// Botón para exportar JSON
const exportButton = BUI.Component.create<BUI.PanelSection>(() => {
  return BUI.html`
    <bim-button label="Export IFC JSON" @click="${async () => {
      if (modelID === null) {
        alert("No IFC file loaded.");
        return;
      }
      const exported = await exporter.export(webIfc, modelID);
      const serialized = JSON.stringify(exported);
      const file = new File([new Blob([serialized])], "properties.json");
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.download = "properties.json";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      link.remove();
    }}"></bim-button>
  `;
});

document.body.append(exportButton);

