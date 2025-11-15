# How to Get Test Avatar (Ready Player Me)

## Quick Start: Get Your First Avatar

### Option 1: Use Ready Player Me Hub (Recommended for Testing)

**Step 1: Create Ready Player Me Account**
1. Visit https://readyplayer.me/
2. Click "Sign Up" (free account)
3. Verify your email

**Step 2: Create Avatar via Web**
1. Go to https://demo.readyplayer.me/
2. Choose avatar creation method:
   - **Selfie**: Upload photo (AI generates avatar)
   - **From scratch**: Customize manually
3. Customize appearance:
   - Skin tone
   - Hair style and color
   - Facial features
   - Clothing (optional)
4. Click "Next" when satisfied

**Step 3: Export Avatar as GLB**
1. After creation, you'll get an avatar URL like:
   ```
   https://models.readyplayer.me/[ID].glb
   ```
2. Download the GLB file:
   - Open URL in browser (it will download)
   - Or use curl: `curl -o sofia.glb https://models.readyplayer.me/[ID].glb`

**Step 4: Verify Morph Targets**
- Ready Player Me avatars include ARKit-compatible blend shapes
- 52 morph targets for facial animation
- Includes: jaw, mouth, eyes, eyebrows, etc.

---

## Option 2: Use Ready Player Me Developer Hub (For Production)

**Step 1: Create Developer Account**
1. Go to https://studio.readyplayer.me/
2. Sign up for developer access
3. Create a new application

**Step 2: Get Application ID**
1. In the dashboard, note your Application ID
2. This allows for customization and branding

**Step 3: Use Avatar Creator SDK** (Optional)
- Embed avatar creator in your app
- Users create their own avatars
- For future implementation (not MVP)

---

## Option 3: Use Pre-Made Test Avatars

For immediate testing, use these public Ready Player Me avatars:

### Test Avatar URLs (No Account Required)

**Avatar 1 - Female (Sofia placeholder):**
```
https://models.readyplayer.me/64bfa36f0e72c63d7c3f4c4c.glb
```

**Avatar 2 - Male (Marcus placeholder):**
```
https://models.readyplayer.me/64bfa36f0e72c63d7c3f4c5d.glb
```

**Avatar 3 - Asian Female (Yuki placeholder):**
```
https://models.readyplayer.me/64bfa36f0e72c63d7c3f4c6e.glb
```

> **Note:** These URLs are examples. You should create your own avatars for production use.

---

## Option 4: Custom GLB from Alternative Sources

### Sketchfab (If Ready Player Me doesn't meet needs)

1. Go to https://sketchfab.com/
2. Search for "rigged character" or "avatar"
3. Filter by:
   - **Downloadable**
   - **Animated** (if you want animations)
   - **Low poly** (<50k polygons)
4. Check license (many are CC-BY or free)
5. Download GLB format

**Important:** Most Sketchfab models do NOT have ARKit morph targets for lip-sync. You'd need to add them manually in Blender.

---

## Testing the Avatar in FluentGym

### Method 1: Test from URL (Easiest)

Update `app/avatar-test.tsx`:

```typescript
import { AvatarDisplay } from '../src/components';

export default function AvatarTestScreen() {
  return (
    <AvatarDisplay
      source="https://models.readyplayer.me/YOUR_AVATAR_ID.glb"
      onLoad={(avatar) => {
        console.log('Avatar loaded!');
        console.log('Morph targets:', avatar.morphTargets);
      }}
      onError={(error) => {
        console.error('Avatar load failed:', error);
      }}
    />
  );
}
```

### Method 2: Test from Bundled Asset

**Step 1: Add avatar to assets**
```bash
# In FluentGym directory
mkdir -p assets/avatars
# Place your downloaded GLB file here
cp ~/Downloads/sofia.glb assets/avatars/sofia.glb
```

**Step 2: Update avatar-test.tsx**
```typescript
import { AvatarDisplay } from '../src/components';

export default function AvatarTestScreen() {
  return (
    <AvatarDisplay
      source={require('../assets/avatars/sofia.glb')}
      onLoad={(avatar) => {
        console.log('Avatar loaded!');
        console.log('Animations:', avatar.animations.length);
        console.log('Morph targets:', avatar.morphTargets.length);
      }}
    />
  );
}
```

---

## Avatar Specifications for FluentGym

### Required Specs
- ✅ **Format:** GLB (binary GLTF)
- ✅ **Polygons:** <50,000 triangles
- ✅ **Textures:** 1024x1024 or 2048x2048
- ✅ **Morph Targets:** ARKit 52 blend shapes (preferred)
- ✅ **Rigging:** Humanoid skeleton
- ✅ **File Size:** <10 MB

### Morph Targets Needed for Lip-Sync
Required blend shapes (ARKit standard):
- `jawOpen` - Jaw movement (essential)
- `jawForward` - Jaw protrusion
- `jawLeft` / `jawRight` - Jaw side movement
- `mouthClose` - Mouth closing
- `mouthFunnel` - Mouth funnel (O shape)
- `mouthPucker` - Mouth pucker (kiss)
- `mouthSmileLeft` / `mouthSmileRight` - Smiling
- `mouthFrownLeft` / `mouthFrownRight` - Frowning
- Plus 42 more for detailed expressions

### How to Verify Morph Targets

Load avatar and check console:
```typescript
<AvatarDisplay
  source="YOUR_AVATAR_URL"
  onLoad={(avatar) => {
    avatar.morphTargets.forEach(morphInfo => {
      console.log(`Mesh: ${morphInfo.meshName}`);
      console.log(`Targets: ${morphInfo.targetNames.join(', ')}`);
    });
  }}
/>
```

Expected output:
```
Mesh: Wolf3D_Head
Targets: browInnerUp, browDownLeft, browDownRight, jawOpen, ...
```

---

## Creating the 5 Production Avatars

When ready to create production avatars:

### Avatar 1: Sofia (Spanish Tutor)
- **Gender:** Female
- **Ethnicity:** Hispanic/Mediterranean
- **Features:**
  - Warm skin tone
  - Dark brown hair (wavy/curly)
  - Brown eyes
  - Friendly, approachable look
- **Outfit:** Professional but warm (blouse/cardigan)

### Avatar 2: Marcus (Professional Coach)
- **Gender:** Male
- **Ethnicity:** African American / Mixed
- **Features:**
  - Medium-dark skin tone
  - Short professional haircut
  - Confident expression
  - Professional appearance
- **Outfit:** Business casual (shirt/blazer)

### Avatar 3: Yuki (Japanese Expert)
- **Gender:** Female
- **Ethnicity:** East Asian (Japanese)
- **Features:**
  - Light skin tone
  - Black straight hair (shoulder-length)
  - Gentle, patient expression
- **Outfit:** Modern casual/professional

### Avatar 4: Elena (Cultural Expert)
- **Gender:** Female
- **Ethnicity:** Slavic/Eastern European
- **Features:**
  - Light skin tone
  - Blonde or light brown hair
  - Intelligent, thoughtful expression
- **Outfit:** Professional/academic

### Avatar 5: Raj (Encouraging Mentor)
- **Gender:** Male
- **Ethnicity:** South Asian (Indian)
- **Features:**
  - Brown skin tone
  - Dark hair
  - Warm, encouraging expression
- **Outfit:** Smart casual

---

## Cost Breakdown

### Free Tier (MVP)
- ✅ 1,000 avatar generations/month
- ✅ All morph targets included
- ✅ Commercial use allowed
- **Cost:** $0/month

### Pro Tier (If needed)
- ✅ Unlimited avatars
- ✅ Custom branding
- ✅ Premium assets
- ✅ Priority support
- **Cost:** $99/month

### Custom Solution
- Commission 5 avatars from 3D artist
- Full ownership
- **Cost:** $4,000-5,000 one-time

**Recommendation:** Start with Free tier, upgrade to Pro only if we exceed 1,000 avatars/month (unlikely in MVP).

---

## Next Steps

**For Week 2.5 Testing:**
1. Create 1 test avatar using Ready Player Me
2. Download GLB file
3. Test loading in AvatarDisplay component
4. Verify morph targets are accessible
5. Confirm 60 FPS performance

**For Week 4 (Multi-Avatar):**
1. Create all 5 production avatars
2. Customize for cultural authenticity
3. Optimize if needed (polygon reduction)
4. Set up avatar switching system

---

## Troubleshooting

### Avatar doesn't load
- Check network connection
- Verify URL is correct
- Check console for errors
- Try loading from bundled asset instead

### No morph targets found
- Not all GLB models have morph targets
- Verify source is Ready Player Me or custom with morph targets
- Check console output when loading

### Performance issues
- Reduce texture resolution (1024x1024 max)
- Check polygon count (<50k)
- Disable shadows if needed
- Test on target device (not just simulator)

### Avatar looks wrong
- Check lighting in scene
- Verify PBR materials are supported
- Adjust camera position
- Check avatar scale

---

**Status:** Ready to obtain test avatar for Week 2.5
**Recommendation:** Use Ready Player Me demo to create Sofia avatar
**Timeline:** 10 minutes to create and download test avatar
