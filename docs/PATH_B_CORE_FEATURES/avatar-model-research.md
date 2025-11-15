# Avatar Model Research & Selection

## Requirements

For FluentGym's language learning avatars, we need:

### Functional Requirements
- ✅ Realistic human appearance (not cartoon/anime)
- ✅ Facial morph targets for lip-sync (ARKit 52 blend shapes ideal)
- ✅ Cultural diversity (5 distinct avatars: Sofia, Marcus, Yuki, Elena, Raj)
- ✅ Mobile-optimized (target: <50k polygons per avatar)
- ✅ GLB/GLTF format compatibility
- ✅ Rigged for animation
- ✅ PBR materials for realistic lighting

### Technical Requirements
- ✅ File size: <10 MB per avatar (compressed)
- ✅ Texture resolution: 1024x1024 or 2048x2048
- ✅ Support for morph targets (blend shapes)
- ✅ Bone structure for head movement
- ✅ Compatible with Three.js GLTFLoader

### Budget Considerations
- Initial: 5 avatars needed
- Cost per avatar: Target <$500
- Customization ability for future expansion

---

## Option 1: Ready Player Me ⭐ RECOMMENDED

**Website:** https://readyplayer.me/

### Pros
- ✅ **Free tier available** with 1000 avatar generations/month
- ✅ **Built-in morph targets** (ARKit compatible blend shapes)
- ✅ **Optimized for mobile** (~30k polygons)
- ✅ **GLB export** directly supported
- ✅ **Diverse customization** (skin tone, hair, facial features)
- ✅ **API integration** for programmatic avatar creation
- ✅ **PBR materials** included
- ✅ **Commercial use allowed** (with proper license)
- ✅ **Active development** and documentation

### Cons
- ⚠️ Limited to their base mesh topology
- ⚠️ Some customization constraints
- ⚠️ Premium features require subscription ($99/month for advanced features)
- ⚠️ Avatar style may look similar across different characters

### Technical Specs
- **Polygons:** ~30,000 triangles
- **Textures:** 1024x1024 (body) + 1024x1024 (face)
- **Morph Targets:** 52 ARKit blend shapes
- **File Format:** GLB
- **File Size:** 3-5 MB average
- **Rigging:** Full body rig with facial bones

### Implementation Path
1. Use Ready Player Me Hub to create 5 base avatars
2. Customize each for cultural authenticity:
   - **Sofia** (Spanish): Warm skin tone, dark hair, Mediterranean features
   - **Marcus** (Professional): Medium skin tone, professional hairstyle
   - **Yuki** (Japanese): East Asian features, black hair
   - **Elena** (Slavic): Light skin tone, blonde/light brown hair
   - **Raj** (Indian): Brown skin tone, dark hair, South Asian features
3. Export as GLB with morph targets
4. Host files in CDN or bundle with app
5. Use Three.js GLTFLoader to load

### Cost
- **Free Tier:** 1,000 avatars/month (sufficient for initial testing)
- **Pro:** $99/month (unlimited avatars, custom branding)
- **Enterprise:** Custom pricing (full white-label, advanced features)

**Recommendation:** Start with free tier for development, upgrade to Pro if needed for production.

---

## Option 2: Custom GLB Models from Artists

**Platforms:** Fiverr, Upwork, Sketchfab, ArtStation

### Pros
- ✅ **Full creative control** over appearance
- ✅ **Unique designs** tailored exactly to vision
- ✅ **No licensing restrictions** (you own the assets)
- ✅ **Cultural authenticity** can be maximized
- ✅ **Optimized for your use case**

### Cons
- ❌ **Expensive:** $500-$1,500 per avatar
- ❌ **Time-consuming:** 2-4 weeks per avatar
- ❌ **Requires detailed specs** and art direction
- ❌ **Quality varies** by artist
- ❌ **Morph targets not guaranteed** (need to specify in commission)
- ❌ **Rigging complexity** may require additional cost

### Technical Specs
- Customizable based on commission specs
- Need to specify: polygon count, texture resolution, morph targets, file format

### Cost Estimate
- **5 avatars × $800 average = $4,000**
- Additional $500-1,000 for revisions
- **Total: $4,500-$5,000**

**Recommendation:** Consider for future iteration if Ready Player Me doesn't meet needs.

---

## Option 3: VRoid Studio

**Website:** https://vroid.com/en/studio

### Pros
- ✅ **Free** to use
- ✅ **Easy customization** with GUI
- ✅ **Anime/manga style** characters
- ✅ **VRM export** (convertible to GLB)

### Cons
- ❌ **Anime aesthetic** - Not ideal for professional language learning
- ❌ **Limited realism** - May not feel authentic
- ❌ **Morph targets limited** - Not ARKit compatible
- ❌ **Mobile performance** - Can be heavy

**Recommendation:** Not suitable for FluentGym's professional, realistic aesthetic.

---

## Option 4: Mixamo (Adobe)

**Website:** https://www.mixamo.com/

### Pros
- ✅ **Free** with Adobe account
- ✅ **Auto-rigging** for body animation
- ✅ **FBX export** (convertible to GLB)
- ✅ **Large library** of base characters

### Cons
- ❌ **Limited facial expressions** - Not designed for lip-sync
- ❌ **No morph targets** - Would need manual setup
- ❌ **Outdated models** - Quality varies
- ❌ **Body-focused** - Not optimized for facial animation

**Recommendation:** Not suitable - lacks facial animation support needed for lip-sync.

---

## Option 5: MetaHuman (Unreal Engine)

**Website:** https://www.unrealengine.com/en-US/metahuman

### Pros
- ✅ **Photorealistic** quality
- ✅ **Full facial rig** with extensive morph targets
- ✅ **Cultural diversity** options
- ✅ **Professional quality**

### Cons
- ❌ **Too heavy for mobile** (>100k polygons)
- ❌ **Large file sizes** (50+ MB)
- ❌ **Unreal-specific** - Complex to export to Three.js
- ❌ **Requires Unreal Engine** expertise
- ❌ **Performance overhead** - Not optimized for React Native

**Recommendation:** Not feasible for mobile web/React Native app.

---

## Option 6: AI-Generated Avatars (Meshcapade, etc.)

**Emerging technology**

### Pros
- ✅ **Customizable via AI** prompts
- ✅ **Diverse appearances** possible
- ✅ **Potentially automated**

### Cons
- ❌ **Experimental** - Not production-ready
- ❌ **Unpredictable quality**
- ❌ **Licensing unclear**
- ❌ **No morph target guarantee**

**Recommendation:** Too experimental for MVP.

---

## Decision Matrix

| Option | Cost | Time to Implement | Quality | Lip-Sync Support | Mobile Performance | Recommendation |
|--------|------|-------------------|---------|------------------|-------------------|----------------|
| **Ready Player Me** | Free-$99/mo | 1-2 days | Good | ✅ Excellent | ✅ Optimized | ⭐ **BEST** |
| Custom Artists | $4,000-5,000 | 8-12 weeks | Excellent | ⚠️ Depends | ✅ Customizable | Future option |
| VRoid | Free | 2-3 days | Anime style | ❌ Limited | ⚠️ Variable | Not suitable |
| Mixamo | Free | 1 day | Dated | ❌ None | ⚠️ Variable | Not suitable |
| MetaHuman | Free | 3-5 days | Photorealistic | ✅ Excellent | ❌ Too heavy | Not feasible |
| AI-Generated | Unknown | Unknown | Unknown | ❌ Unknown | Unknown | Too risky |

---

## Final Recommendation: Ready Player Me

**Why Ready Player Me wins:**

1. **Speed to Market:** Can have all 5 avatars ready in 1-2 days
2. **Cost-Effective:** Free tier sufficient for MVP
3. **Proven Technology:** Used by major apps (Spatial, Somnium Space, etc.)
4. **Lip-Sync Ready:** ARKit blend shapes built-in
5. **Mobile Optimized:** Already tuned for mobile performance
6. **Scalable:** Can upgrade features as needed
7. **Low Risk:** If it doesn't work, we can pivot to custom models

**Implementation Plan:**

### Phase 1: Test with 1 Avatar (Week 2.1-2.4)
1. Create Sofia avatar via Ready Player Me Hub
2. Export GLB with morph targets
3. Load into Avatar3DScene component
4. Verify rendering and performance
5. Test basic morph target manipulation

### Phase 2: Create All 5 Avatars (Week 2.5)
1. Design each avatar for cultural authenticity
2. Export all as GLB files
3. Set up avatar switching system
4. Optimize loading (caching, preloading)

### Phase 3: Fallback Plan (If Ready Player Me Insufficient)
- Commission 1 custom avatar from artist
- Compare quality, cost, and timeline
- Make decision: continue RPM or switch to custom

---

## Technical Implementation Notes

### GLB Loading in React Native
```typescript
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ExpoAssetLoaderPlugin } from 'expo-three';

const loader = new GLTFLoader();

// For bundled assets
const loadAvatarFromAsset = async (assetModule) => {
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();
  return new Promise((resolve, reject) => {
    loader.load(
      asset.localUri || asset.uri,
      (gltf) => resolve(gltf.scene),
      undefined,
      reject
    );
  });
};

// For remote URLs
const loadAvatarFromURL = (url) => {
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
};
```

### Morph Target Access
```typescript
// Access morph targets (blend shapes)
avatar.traverse((child) => {
  if (child.isMesh && child.morphTargetDictionary) {
    // Example: Jaw Open for lip-sync
    const jawOpenIndex = child.morphTargetDictionary['jawOpen'];
    child.morphTargetInfluences[jawOpenIndex] = 0.5; // 50% open
  }
});
```

### Asset Organization
```
fluentgym/apps/FluentGym/
└── assets/
    └── avatars/
        ├── sofia.glb           (3-5 MB)
        ├── marcus.glb          (3-5 MB)
        ├── yuki.glb            (3-5 MB)
        ├── elena.glb           (3-5 MB)
        └── raj.glb             (3-5 MB)
Total: ~15-25 MB (acceptable for app bundle)
```

### CDN Alternative (Recommended for Production)
- Host GLB files on CDN (Cloudflare, AWS S3)
- Download on first use
- Cache locally with AsyncStorage
- Benefits: Smaller app bundle, easier updates

---

## Next Steps

**Week 2.1:** ✅ Research complete - Ready Player Me selected

**Week 2.2:** Install GLTFLoader dependencies
- `three/examples/jsm/loaders/GLTFLoader`
- `expo-asset` for asset management
- `expo-file-system` for caching

**Week 2.3:** Create test avatar (Sofia)
- Design in Ready Player Me Hub
- Export with morph targets
- Download GLB file

**Week 2.4:** Implement avatar loader component
- Create `AvatarLoader.ts` utility
- Add loading states and error handling
- Test with Sofia model

**Timeline:** Week 2 completion in ~5-6 days of work

---

**Status:** ✅ Research Complete - Ready to Implement
**Decision:** Ready Player Me for MVP
**Fallback:** Custom commissioned avatars if needed
