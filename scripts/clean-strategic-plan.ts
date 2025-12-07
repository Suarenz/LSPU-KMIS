import fs from 'fs'
import path from 'path'

interface KRA {
  kra_id: string
  [key: string]: any
}

interface StrategicPlan {
  strategic_plan_meta: any
  kras: KRA[]
}

async function cleanStrategicPlan() {
  console.log('🔍 Checking strategic plan for duplicates...')
  
  const filePath = path.join(process.cwd(), 'strategic_plan.json')
  const rawData = fs.readFileSync(filePath, 'utf-8')
  const data: StrategicPlan = JSON.parse(rawData)
  
  const kraIds = new Map<string, number>()
  const duplicates: string[] = []
  
  // Find duplicates
  data.kras.forEach((kra, index) => {
    if (kraIds.has(kra.kra_id)) {
      duplicates.push(`${kra.kra_id} (indices: ${kraIds.get(kra.kra_id)}, ${index})`)
    } else {
      kraIds.set(kra.kra_id, index)
    }
  })
  
  if (duplicates.length > 0) {
    console.log(`⚠️  Found ${duplicates.length} duplicate(s):`)
    duplicates.forEach(dup => console.log(`   - ${dup}`))
    
    // Remove duplicates (keep first occurrence)
    const seen = new Set<string>()
    const cleanedKRAs = data.kras.filter(kra => {
      if (seen.has(kra.kra_id)) {
        console.log(`   ✂️  Removing duplicate: ${kra.kra_id}`)
        return false
      }
      seen.add(kra.kra_id)
      return true
    })
    
    // Update meta
    const cleaned: StrategicPlan = {
      ...data,
      kras: cleanedKRAs,
      strategic_plan_meta: {
        ...data.strategic_plan_meta,
        total_kras: cleanedKRAs.length
      }
    }
    
    // Create backup
    const backupPath = path.join(process.cwd(), 'strategic_plan.backup.json')
    fs.writeFileSync(backupPath, rawData, 'utf-8')
    console.log(`💾 Backup created: strategic_plan.backup.json`)
    
    // Write cleaned version
    fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2), 'utf-8')
    console.log(`✅ Cleaned strategic plan saved (${cleanedKRAs.length} KRAs)`)
  } else {
    console.log('✅ No duplicates found!')
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   Total KRAs: ${data.kras.length} → ${kraIds.size}`)
  console.log(`   Duplicates removed: ${duplicates.length}`)
}

cleanStrategicPlan().catch(console.error)
