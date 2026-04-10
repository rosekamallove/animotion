import "./index.css";
import { Composition, Folder } from "remotion";
import { MyComposition } from "./Composition";
import { TurboQuantComposition } from "./TurboQuant/TurboQuantComposition";
import { KVCacheComposition } from "./TurboQuant/KVCacheComposition";
import { KVGrowthComposition } from "./TurboQuant/KVGrowthComposition";
import { MetadataTax } from "./TurboQuant/scenes/MetadataTax";
import { CompressionImpact } from "./TurboQuant/scenes/CompressionImpact";
import { QJLProjection } from "./TurboQuant/scenes/QJLProjection";
import { KVCacheMemory } from "./TurboQuant/scenes/KVCacheMemory";
import { VRAMRetention } from "./TurboQuant/scenes/VRAMRetention";
import { DropInMath } from "./TurboQuant/scenes/DropInMath";

/* ANIMOTION_IMPORTS_START */
import { NeuralNetworkTextProcessor } from "./generated/NeuralNetworkTextProcessor";
import { NeuralNetworkTextProcessing } from "./generated/NeuralNetworkTextProcessing";
import { QuantizationExplainer } from "./generated/QuantizationExplainer";
import { LlmTokenizationExplainer } from "./generated/LlmTokenizationExplainer";
import { NeuralNetworkCatRecognition } from "./generated/NeuralNetworkCatRecognition";
import { MarketingFunnel } from "./generated/MarketingFunnel";
import { LLMTokenisation } from "./generated/LLMTokenisation";
/* ANIMOTION_IMPORTS_END */

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HelplyPromo"
        component={MyComposition}
        durationInFrames={2370}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TurboQuantExplainer"
        component={TurboQuantComposition}
        durationInFrames={10760}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="KVCacheExplainer"
        component={KVCacheComposition}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="KVCacheGrowthChart"
        component={KVGrowthComposition}
        durationInFrames={1140}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="MetadataTax"
        component={MetadataTax}
        durationInFrames={330}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CompressionImpact"
        component={CompressionImpact}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="KVCacheMemory"
        component={KVCacheMemory}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="VRAMRetention"
        component={VRAMRetention}
        durationInFrames={330}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DropInMath"
        component={DropInMath}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="QJLProjection"
        component={QJLProjection}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      {/* ANIMOTION_COMPOSITIONS_START */}
      <Folder name="Generated">
        <Composition
          id="NeuralNetworkTextProcessor"
          component={NeuralNetworkTextProcessor}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="NeuralNetworkTextProcessing"
          component={NeuralNetworkTextProcessing}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="QuantizationExplainer"
          component={QuantizationExplainer}
          durationInFrames={840}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="LlmTokenizationExplainer"
          component={LlmTokenizationExplainer}
          durationInFrames={450}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="NeuralNetworkCatRecognition"
          component={NeuralNetworkCatRecognition}
          durationInFrames={840}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="MarketingFunnel"
          component={MarketingFunnel}
          durationInFrames={840}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="LLMTokenisation"
          component={LLMTokenisation}
          durationInFrames={300}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
      {/* ANIMOTION_COMPOSITIONS_END */}

    </>
  );
};
