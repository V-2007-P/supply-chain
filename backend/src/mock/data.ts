export type ShipmentStatus = 'IN_TRANSIT' | 'DELAYED' | 'OUT_FOR_DELIVERY' | 'HELD_AT_HUB' | 'DELIVERED';
export type RiskScore = 'LOW' | 'MEDIUM' | 'HIGH';

export interface MockShipment {
  id: string; awb: string; source: string; destination: string;
  current_location: string; current_hub: string; status: ShipmentStatus;
  risk_score: RiskScore; delay_minutes: number; edd: string;
  last_scan_time: string; lat: number; lng: number; created_at: string;
}

export type AlertType = 'TRAFFIC' | 'WEATHER' | 'HUB_OVERLOAD' | 'DELAY' | 'VEHICLE_BREAKDOWN';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface MockAlert {
  id: string; type: AlertType; severity: AlertSeverity; region: string;
  route: string; message: string; affected_shipments: string[];
  resolved: boolean; created_at: string;
}

export interface MockRecommendation {
  id: string; type: string; description: string; affected_shipments: string[];
  time_saved_minutes: number; confidence_percent: number; status: string; created_at: string;
}

const now = new Date();
const d = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();
const past = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();

export const MOCK_SHIPMENTS: MockShipment[] = [
  { id:'SHP-001',awb:'FXND2284019IN',source:'Delhi',destination:'Lucknow',current_location:'Kanpur',current_hub:'Kanpur Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:0,edd:d(8),last_scan_time:past(2),lat:26.4499,lng:80.3319,created_at:past(24) },
  { id:'SHP-002',awb:'FDTM9934521IN',source:'Mumbai',destination:'Delhi',current_location:'Agra',current_hub:'Agra Hub',status:'DELAYED',risk_score:'HIGH',delay_minutes:95,edd:d(12),last_scan_time:past(1),lat:27.1767,lng:78.0081,created_at:past(36) },
  { id:'SHP-003',awb:'FXND3312045IN',source:'Kolkata',destination:'Patna',current_location:'Dhanbad',current_hub:'Dhanbad Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:30,edd:d(6),last_scan_time:past(3),lat:23.7957,lng:86.4304,created_at:past(18) },
  { id:'SHP-004',awb:'FDTM8821344IN',source:'Lucknow',destination:'Varanasi',current_location:'Lucknow',current_hub:'Lucknow Hub',status:'OUT_FOR_DELIVERY',risk_score:'LOW',delay_minutes:0,edd:d(3),last_scan_time:past(1),lat:26.8467,lng:80.9462,created_at:past(12) },
  { id:'SHP-005',awb:'FXND4410238IN',source:'Patna',destination:'Gaya',current_location:'Patna',current_hub:'Patna Hub',status:'HELD_AT_HUB',risk_score:'HIGH',delay_minutes:180,edd:d(18),last_scan_time:past(5),lat:25.5941,lng:85.1376,created_at:past(48) },
  { id:'SHP-006',awb:'FDTM7723891IN',source:'Delhi',destination:'Kanpur',current_location:'Mathura',current_hub:'Mathura Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:0,edd:d(5),last_scan_time:past(2),lat:27.4924,lng:77.6737,created_at:past(10) },
  { id:'SHP-007',awb:'FXND5598102IN',source:'Varanasi',destination:'Kolkata',current_location:'Dhanbad',current_hub:'Dhanbad Hub',status:'DELAYED',risk_score:'HIGH',delay_minutes:120,edd:d(14),last_scan_time:past(4),lat:23.7957,lng:86.4304,created_at:past(30) },
  { id:'SHP-008',awb:'FDTM6634217IN',source:'Jhansi',destination:'Delhi',current_location:'Agra',current_hub:'Agra Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:45,edd:d(7),last_scan_time:past(2),lat:27.1767,lng:78.0081,created_at:past(15) },
  { id:'SHP-009',awb:'FXND6671039IN',source:'Muzaffarpur',destination:'Patna',current_location:'Muzaffarpur',current_hub:'Muzaffarpur Hub',status:'OUT_FOR_DELIVERY',risk_score:'LOW',delay_minutes:0,edd:d(2),last_scan_time:past(1),lat:26.1209,lng:85.3647,created_at:past(8) },
  { id:'SHP-010',awb:'FDTM5512678IN',source:'Mumbai',destination:'Kolkata',current_location:'Nagpur',current_hub:'Nagpur Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:60,edd:d(20),last_scan_time:past(3),lat:21.1458,lng:79.0882,created_at:past(40) },
  { id:'SHP-011',awb:'FXND7789234IN',source:'Delhi',destination:'Patna',current_location:'Lucknow',current_hub:'Lucknow Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:15,edd:d(10),last_scan_time:past(2),lat:26.8467,lng:80.9462,created_at:past(20) },
  { id:'SHP-012',awb:'FDTM4456901IN',source:'Kanpur',destination:'Varanasi',current_location:'Allahabad',current_hub:'Prayagraj Hub',status:'DELAYED',risk_score:'HIGH',delay_minutes:150,edd:d(16),last_scan_time:past(6),lat:25.4358,lng:81.8463,created_at:past(35) },
  { id:'SHP-013',awb:'FXND8823456IN',source:'Gaya',destination:'Dhanbad',current_location:'Gaya',current_hub:'Gaya Hub',status:'HELD_AT_HUB',risk_score:'MEDIUM',delay_minutes:75,edd:d(9),last_scan_time:past(4),lat:24.7955,lng:84.9994,created_at:past(22) },
  { id:'SHP-014',awb:'FDTM3345012IN',source:'Kolkata',destination:'Muzaffarpur',current_location:'Patna',current_hub:'Patna Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:0,edd:d(7),last_scan_time:past(1),lat:25.5941,lng:85.1376,created_at:past(16) },
  { id:'SHP-015',awb:'FXND9934567IN',source:'Lucknow',destination:'Jhansi',current_location:'Kanpur',current_hub:'Kanpur Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:30,edd:d(6),last_scan_time:past(3),lat:26.4499,lng:80.3319,created_at:past(14) },
  { id:'SHP-016',awb:'FDTM2234123IN',source:'Delhi',destination:'Mumbai',current_location:'Surat',current_hub:'Surat Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:0,edd:d(11),last_scan_time:past(2),lat:21.1702,lng:72.8311,created_at:past(28) },
  { id:'SHP-017',awb:'FXND1123890IN',source:'Varanasi',destination:'Delhi',current_location:'Lucknow',current_hub:'Lucknow Hub',status:'DELAYED',risk_score:'HIGH',delay_minutes:200,edd:d(22),last_scan_time:past(7),lat:26.8467,lng:80.9462,created_at:past(50) },
  { id:'SHP-018',awb:'FDTM9901456IN',source:'Patna',destination:'Kolkata',current_location:'Dhanbad',current_hub:'Dhanbad Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:40,edd:d(8),last_scan_time:past(2),lat:23.7957,lng:86.4304,created_at:past(18) },
  { id:'SHP-019',awb:'FXND2278901IN',source:'Muzaffarpur',destination:'Varanasi',current_location:'Patna',current_hub:'Patna Hub',status:'OUT_FOR_DELIVERY',risk_score:'LOW',delay_minutes:0,edd:d(4),last_scan_time:past(1),lat:25.5941,lng:85.1376,created_at:past(10) },
  { id:'SHP-020',awb:'FDTM8890123IN',source:'Jhansi',destination:'Kanpur',current_location:'Jhansi',current_hub:'Jhansi Hub',status:'HELD_AT_HUB',risk_score:'HIGH',delay_minutes:90,edd:d(13),last_scan_time:past(5),lat:25.4484,lng:78.5685,created_at:past(25) },
  { id:'SHP-021',awb:'FXND3367234IN',source:'Delhi',destination:'Varanasi',current_location:'Lucknow',current_hub:'Lucknow Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:45,edd:d(9),last_scan_time:past(3),lat:26.8467,lng:80.9462,created_at:past(20) },
  { id:'SHP-022',awb:'FDTM7712567IN',source:'Kolkata',destination:'Delhi',current_location:'Varanasi',current_hub:'Varanasi Hub',status:'DELAYED',risk_score:'HIGH',delay_minutes:130,edd:d(18),last_scan_time:past(4),lat:25.3176,lng:82.9739,created_at:past(38) },
  { id:'SHP-023',awb:'FXND4445890IN',source:'Mumbai',destination:'Lucknow',current_location:'Agra',current_hub:'Agra Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:0,edd:d(12),last_scan_time:past(2),lat:27.1767,lng:78.0081,created_at:past(22) },
  { id:'SHP-024',awb:'FDTM6623123IN',source:'Kanpur',destination:'Patna',current_location:'Allahabad',current_hub:'Prayagraj Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:35,edd:d(8),last_scan_time:past(3),lat:25.4358,lng:81.8463,created_at:past(15) },
  { id:'SHP-025',awb:'FXND5534456IN',source:'Gaya',destination:'Muzaffarpur',current_location:'Patna',current_hub:'Patna Hub',status:'OUT_FOR_DELIVERY',risk_score:'LOW',delay_minutes:0,edd:d(3),last_scan_time:past(1),lat:25.5941,lng:85.1376,created_at:past(9) },
  { id:'SHP-026',awb:'FDTM5501789IN',source:'Dhanbad',destination:'Kolkata',current_location:'Asansol',current_hub:'Asansol Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:20,edd:d(5),last_scan_time:past(2),lat:23.6889,lng:86.9661,created_at:past(12) },
  { id:'SHP-027',awb:'FXND6690012IN',source:'Delhi',destination:'Gaya',current_location:'Varanasi',current_hub:'Varanasi Hub',status:'DELAYED',risk_score:'HIGH',delay_minutes:160,edd:d(20),last_scan_time:past(6),lat:25.3176,lng:82.9739,created_at:past(44) },
  { id:'SHP-028',awb:'FDTM4478345IN',source:'Lucknow',destination:'Mumbai',current_location:'Bhopal',current_hub:'Bhopal Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:50,edd:d(14),last_scan_time:past(3),lat:23.2599,lng:77.4126,created_at:past(30) },
  { id:'SHP-029',awb:'FXND7756678IN',source:'Patna',destination:'Jhansi',current_location:'Allahabad',current_hub:'Prayagraj Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:0,edd:d(10),last_scan_time:past(2),lat:25.4358,lng:81.8463,created_at:past(18) },
  { id:'SHP-030',awb:'FDTM3312901IN',source:'Varanasi',destination:'Muzaffarpur',current_location:'Patna',current_hub:'Patna Hub',status:'HELD_AT_HUB',risk_score:'MEDIUM',delay_minutes:80,edd:d(11),last_scan_time:past(4),lat:25.5941,lng:85.1376,created_at:past(26) },
  { id:'SHP-031',awb:'FXND8878234IN',source:'Kolkata',destination:'Jhansi',current_location:'Varanasi',current_hub:'Varanasi Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:40,edd:d(15),last_scan_time:past(3),lat:25.3176,lng:82.9739,created_at:past(22) },
  { id:'SHP-032',awb:'FDTM2290567IN',source:'Muzaffarpur',destination:'Delhi',current_location:'Lucknow',current_hub:'Lucknow Hub',status:'DELAYED',risk_score:'HIGH',delay_minutes:110,edd:d(17),last_scan_time:past(5),lat:26.8467,lng:80.9462,created_at:past(32) },
  { id:'SHP-033',awb:'FXND1189890IN',source:'Jhansi',destination:'Varanasi',current_location:'Kanpur',current_hub:'Kanpur Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:0,edd:d(6),last_scan_time:past(2),lat:26.4499,lng:80.3319,created_at:past(14) },
  { id:'SHP-034',awb:'FDTM9923123IN',source:'Mumbai',destination:'Patna',current_location:'Nagpur',current_hub:'Nagpur Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:55,edd:d(19),last_scan_time:past(3),lat:21.1458,lng:79.0882,created_at:past(36) },
  { id:'SHP-035',awb:'FXND2201456IN',source:'Delhi',destination:'Dhanbad',current_location:'Varanasi',current_hub:'Varanasi Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:10,edd:d(11),last_scan_time:past(2),lat:25.3176,lng:82.9739,created_at:past(20) },
  { id:'SHP-036',awb:'FDTM8834789IN',source:'Kanpur',destination:'Kolkata',current_location:'Varanasi',current_hub:'Varanasi Hub',status:'DELAYED',risk_score:'HIGH',delay_minutes:145,edd:d(16),last_scan_time:past(6),lat:25.3176,lng:82.9739,created_at:past(40) },
  { id:'SHP-037',awb:'FXND3323012IN',source:'Gaya',destination:'Kolkata',current_location:'Dhanbad',current_hub:'Dhanbad Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:0,edd:d(6),last_scan_time:past(1),lat:23.7957,lng:86.4304,created_at:past(11) },
  { id:'SHP-038',awb:'FDTM7745345IN',source:'Lucknow',destination:'Patna',current_location:'Varanasi',current_hub:'Varanasi Hub',status:'OUT_FOR_DELIVERY',risk_score:'LOW',delay_minutes:0,edd:d(4),last_scan_time:past(1),lat:25.3176,lng:82.9739,created_at:past(8) },
  { id:'SHP-039',awb:'FXND4412678IN',source:'Delhi',destination:'Muzaffarpur',current_location:'Patna',current_hub:'Patna Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:35,edd:d(9),last_scan_time:past(2),lat:25.5941,lng:85.1376,created_at:past(17) },
  { id:'SHP-040',awb:'FDTM6656901IN',source:'Kolkata',destination:'Gaya',current_location:'Dhanbad',current_hub:'Dhanbad Hub',status:'HELD_AT_HUB',risk_score:'HIGH',delay_minutes:100,edd:d(14),last_scan_time:past(5),lat:23.7957,lng:86.4304,created_at:past(28) },
  { id:'SHP-041',awb:'FXND5545234IN',source:'Patna',destination:'Delhi',current_location:'Lucknow',current_hub:'Lucknow Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:45,edd:d(10),last_scan_time:past(3),lat:26.8467,lng:80.9462,created_at:past(19) },
  { id:'SHP-042',awb:'FDTM5567567IN',source:'Varanasi',destination:'Jhansi',current_location:'Allahabad',current_hub:'Prayagraj Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:0,edd:d(7),last_scan_time:past(2),lat:25.4358,lng:81.8463,created_at:past(13) },
  { id:'SHP-043',awb:'FXND6678890IN',source:'Muzaffarpur',destination:'Kolkata',current_location:'Patna',current_hub:'Patna Hub',status:'DELAYED',risk_score:'HIGH',delay_minutes:140,edd:d(18),last_scan_time:past(4),lat:25.5941,lng:85.1376,created_at:past(34) },
  { id:'SHP-044',awb:'FDTM4489123IN',source:'Dhanbad',destination:'Varanasi',current_location:'Gaya',current_hub:'Gaya Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:30,edd:d(7),last_scan_time:past(2),lat:24.7955,lng:84.9994,created_at:past(15) },
  { id:'SHP-045',awb:'FXND7723456IN',source:'Jhansi',destination:'Mumbai',current_location:'Bhopal',current_hub:'Bhopal Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:0,edd:d(13),last_scan_time:past(2),lat:23.2599,lng:77.4126,created_at:past(23) },
  { id:'SHP-046',awb:'FDTM3356789IN',source:'Delhi',destination:'Kolkata',current_location:'Varanasi',current_hub:'Varanasi Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:50,edd:d(16),last_scan_time:past(3),lat:25.3176,lng:82.9739,created_at:past(29) },
  { id:'SHP-047',awb:'FXND8812012IN',source:'Mumbai',destination:'Varanasi',current_location:'Nagpur',current_hub:'Nagpur Hub',status:'DELAYED',risk_score:'HIGH',delay_minutes:120,edd:d(21),last_scan_time:past(5),lat:21.1458,lng:79.0882,created_at:past(42) },
  { id:'SHP-048',awb:'FDTM2223345IN',source:'Kanpur',destination:'Muzaffarpur',current_location:'Patna',current_hub:'Patna Hub',status:'IN_TRANSIT',risk_score:'LOW',delay_minutes:0,edd:d(8),last_scan_time:past(1),lat:25.5941,lng:85.1376,created_at:past(14) },
  { id:'SHP-049',awb:'FXND1190678IN',source:'Gaya',destination:'Delhi',current_location:'Allahabad',current_hub:'Prayagraj Hub',status:'IN_TRANSIT',risk_score:'MEDIUM',delay_minutes:40,edd:d(12),last_scan_time:past(3),lat:25.4358,lng:81.8463,created_at:past(21) },
  { id:'SHP-050',awb:'FDTM9978901IN',source:'Dhanbad',destination:'Lucknow',current_location:'Varanasi',current_hub:'Varanasi Hub',status:'HELD_AT_HUB',risk_score:'HIGH',delay_minutes:170,edd:d(24),last_scan_time:past(7),lat:25.3176,lng:82.9739,created_at:past(52) },
];

export const MOCK_ALERTS: MockAlert[] = [
  { id:'ALT-001',type:'TRAFFIC',severity:'CRITICAL',region:'Kanpur-Lucknow',route:'NH19',message:'Major accident on NH19 near Kanpur — 8km tailback. ETA impact: +3hrs for 12 shipments.',affected_shipments:['SHP-001','SHP-006','SHP-015'],resolved:false,created_at:past(1) },
  { id:'ALT-002',type:'WEATHER',severity:'CRITICAL',region:'Bihar-Jharkhand',route:'NH19',message:'Dense fog advisory: Patna–Dhanbad corridor. Visibility below 50m. Night movement suspended.',affected_shipments:['SHP-003','SHP-018','SHP-040'],resolved:false,created_at:past(2) },
  { id:'ALT-003',type:'HUB_OVERLOAD',severity:'WARNING',region:'Varanasi',route:'NH19',message:'Varanasi Hub at 94% capacity. 23 shipments pending unloading. Estimated clearance: 6hrs.',affected_shipments:['SHP-007','SHP-022','SHP-036'],resolved:false,created_at:past(3) },
  { id:'ALT-004',type:'VEHICLE_BREAKDOWN',severity:'WARNING',region:'Agra',route:'NH44',message:'Vehicle breakdown on NH44 near Agra toll. Replacement vehicle dispatched — ETA 90min.',affected_shipments:['SHP-002','SHP-008'],resolved:false,created_at:past(4) },
  { id:'ALT-005',type:'DELAY',severity:'INFO',region:'Muzaffarpur',route:'NH27',message:'Muzaffarpur Hub processing delay due to staff shortage. 15 shipments held for 2hrs.',affected_shipments:['SHP-009','SHP-014'],resolved:false,created_at:past(5) },
  { id:'ALT-006',type:'WEATHER',severity:'WARNING',region:'Jharkhand',route:'NH33',message:'Heavy rain on NH33 between Dhanbad–Ranchi. Surface flooding reported at 3 locations.',affected_shipments:['SHP-026','SHP-037'],resolved:false,created_at:past(6) },
  { id:'ALT-007',type:'TRAFFIC',severity:'INFO',region:'Delhi NCR',route:'NH48',message:'Moderate congestion on NH48 Delhi–Gurgaon section. Expected clearance by 9PM.',affected_shipments:['SHP-016'],resolved:false,created_at:past(7) },
  { id:'ALT-008',type:'HUB_OVERLOAD',severity:'CRITICAL',region:'Patna',route:'NH19',message:'Patna Hub CRITICAL: 107% capacity. All inbound vehicles being redirected to Muzaffarpur.',affected_shipments:['SHP-005','SHP-019','SHP-030'],resolved:false,created_at:past(8) },
];

export const MOCK_RECOMMENDATIONS: MockRecommendation[] = [
  { id:'REC-001',type:'ROUTE_OPTIMIZATION',description:'Reroute 12 NH19 shipments via NH30 (Allahabad bypass) to avoid Kanpur accident zone. Estimated time saving: 2.5hrs per vehicle.',affected_shipments:['SHP-001','SHP-006','SHP-011'],time_saved_minutes:150,confidence_percent:89,status:'PENDING',created_at:past(1) },
  { id:'REC-002',type:'HUB_REBALANCING',description:'Transfer 20 shipments from overloaded Patna Hub to Muzaffarpur Hub. Reduces Patna load to 78%.',affected_shipments:['SHP-005','SHP-019','SHP-030'],time_saved_minutes:120,confidence_percent:92,status:'APPROVED',created_at:past(2) },
  { id:'REC-003',type:'PRIORITY_ESCALATION',description:'Escalate 5 HIGH-risk shipments with >2hr delay to express track. Assign dedicated vehicles.',affected_shipments:['SHP-002','SHP-007','SHP-017'],time_saved_minutes:90,confidence_percent:85,status:'PENDING',created_at:past(3) },
  { id:'REC-004',type:'VEHICLE_REALLOCATION',description:'Reallocate 3 idle vehicles from Lucknow Hub to Varanasi Hub to clear backlog.',affected_shipments:['SHP-022','SHP-036','SHP-046'],time_saved_minutes:60,confidence_percent:78,status:'PENDING',created_at:past(4) },
  { id:'REC-005',type:'SCHEDULE_ADJUSTMENT',description:'Delay next Dhanbad–Kolkata batch by 4hrs to avoid NH33 flooding window.',affected_shipments:['SHP-026','SHP-037'],time_saved_minutes:45,confidence_percent:81,status:'PENDING',created_at:past(5) },
];
