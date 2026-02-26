// 游戏配置
const GAME_CONFIG = {
    SEA_RADIUS: 5000,      // 海域半径（米）
    BATTLE_TIME: 60,       // 到达对角线时间（秒）
    SHELL_SPEED: 2000,     // 炮弹速度（米/秒，增加1倍）
    TORPEDO_SPEED: 666.68, // 鱼雷速度（米/秒）
    TORPEDO_LIFETIME: 18,  // 鱼雷存活时间（秒）
    AI_FIRE_INTERVAL: 5,   // AI开火间隔（秒）
    AI_FIRE_CHANCE: 0.6,   // AI开火概率
    SHELL_HIT_CHANCE: 0.8, // 炮弹命中率
    GRAVITY: 9.8,          // 重力加速度
    
    // 战舰配置
    SHIPS: {
        IOWA: {
            name: '衣阿华',
            type: 'battleship',
            hp: 10000,
            maxHp: 10000,
            shellDamage: 250,
            turretCount: 3,
            torpedoCount: 20,
            torpedoSalvo: 4,
            speed: 60,      // 米/秒（约33节）
            turnSpeed: 0.3, // 转向速度
            length: 270,
            width: 33
        },
        BISMARCK: {
            name: '俾斯麦',
            type: 'battleship',
            hp: 10000,
            maxHp: 10000,
            shellDamage: 250,
            turretCount: 4,
            torpedoCount: 20,
            torpedoSalvo: 4,
            speed: 55,
            turnSpeed: 0.25,
            length: 250,
            width: 36
        },
        TIRPITZ: {
            name: '提尔皮茨',
            type: 'battleship',
            hp: 10000,
            maxHp: 10000,
            shellDamage: 250,
            turretCount: 4,
            torpedoCount: 20,
            torpedoSalvo: 4,
            speed: 55,
            turnSpeed: 0.25,
            length: 250,
            width: 36
        },
        FLETCHER: {
            name: '弗莱彻',
            type: 'destroyer',
            hp: 2000,
            maxHp: 2000,
            shellDamage: 100,
            turretCount: 5,
            torpedoCount: 20,
            torpedoSalvo: 4,
            speed: 70,
            turnSpeed: 0.5,
            length: 115,
            width: 12
        },
        KAGERO: {
            name: '阳炎',
            type: 'destroyer',
            hp: 2000,
            maxHp: 2000,
            shellDamage: 100,
            turretCount: 3,
            torpedoCount: 20,
            torpedoSalvo: 4,
            speed: 70,
            turnSpeed: 0.5,
            length: 118,
            width: 11
        },
        GEORGE: {
            name: '乔治五世',
            type: 'battleship',
            hp: 9000,
            maxHp: 9000,
            shellDamage: 240,
            turretCount: 4,
            torpedoCount: 20,
            torpedoSalvo: 4,
            speed: 55,
            turnSpeed: 0.28,
            length: 227,
            width: 31,
            useGLB: true,  // 使用GLB模型
            glbPath: 'George.glb'
        }
    }
};

// 音频系统
let audioContext = null;
let bgmAudio = null;
let isBgmPlaying = false;

// 初始化音频系统
function initAudio() {
    if (audioContext) return;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // 创建背景音乐 Audio 元素
    if (!bgmAudio) {
        bgmAudio = new Audio('20260224_205607_1.m4a');
        bgmAudio.loop = true; // 循环播放
        bgmAudio.volume = 0.3; // 音量30%
    }
}

// 播放背景音乐
function playBGM() {
    if (isBgmPlaying) return;
    
    isBgmPlaying = true;
    if (bgmAudio) {
        bgmAudio.currentTime = 0;
        bgmAudio.play().catch(err => {
            console.log('BGM播放失败:', err);
        });
    }
}

// 停止背景音乐
function stopBGM() {
    isBgmPlaying = false;
    if (bgmAudio) {
        bgmAudio.pause();
        bgmAudio.currentTime = 0;
    }
}

// 播放炮弹发射音效
function playShellSound() {
    if (!audioContext) return;
    
    const now = audioContext.currentTime;
    
    // 炮声 - 低沉的爆炸声
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    const noise = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.exponentialRampToValueAtTime(50, now + 0.2);
    
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(100, now);
    osc2.frequency.exponentialRampToValueAtTime(30, now + 0.15);
    
    noise.type = 'sawtooth';
    noise.frequency.value = 50;
    
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc1.connect(filter);
    osc2.connect(filter);
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc1.start(now);
    osc2.start(now);
    noise.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
    noise.stop(now + 0.3);
}

// 播放鱼雷发射音效（嗖嗖声）
function playTorpedoSound() {
    if (!audioContext) return;
    
    const now = audioContext.currentTime;
    
    // 嗖嗖声 - 高频扫频
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 5;
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(3000, now);
    osc.frequency.exponentialRampToValueAtTime(500, now + 0.3);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    osc.start(now);
    osc.stop(now + 0.4);
    
    // 水花声
    const noise = audioContext.createOscillator();
    const noiseGain = audioContext.createGain();
    noise.type = 'triangle';
    noise.frequency.setValueAtTime(800, now + 0.1);
    noise.frequency.exponentialRampToValueAtTime(200, now + 0.4);
    noiseGain.gain.setValueAtTime(0.1, now + 0.1);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    noise.connect(noiseGain);
    noiseGain.connect(audioContext.destination);
    noise.start(now + 0.1);
    noise.stop(now + 0.5);
}

// 游戏状态
let gameState = {
    running: false,
    startTime: 0,
    endTime: 0,
    playerShip: null,
    allyShip: null,
    enemyShips: [],
    allShips: [],
    shells: [],
    torpedoes: [],
    explosions: [],
    splashes: [],
    sunkShips: [],
    camera: {
        rotationX: 0,
        rotationY: 0,
        targetRotationX: 0,
        targetRotationY: 0
    },
    touch: {
        startX: 0,
        startY: 0,
        isDragging: false
    },
    crosshair: {
        offsetY: 0,
        maxOffset: 200
    },
    boundaryWarning: false
};

// Three.js 对象
let scene, camera, renderer;
let water, sky, sun;
let clouds = []; // 云朵数组
let wakes = [];  // 尾流数组
let clock = new THREE.Clock();

// 初始化游戏
function init() {
    // 创建场景
    scene = new THREE.Scene();
    
    // 创建相机
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 20000);
    
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 创建环境
    createSky();
    createWater();
    createLighting();
    
    // 事件监听
    window.addEventListener('resize', onWindowResize);
    setupTouchControls();
    setupButtonControls();
    
    // 开始渲染循环
    animate();
}

// 创建天空
function createSky() {
    const skyGeometry = new THREE.SphereGeometry(15000, 32, 32);
    const skyMaterial = new THREE.MeshBasicMaterial({
        color: 0x87CEEB, // 淡蓝色天空
        side: THREE.BackSide,
        fog: false
    });
    sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);
    
    // 创建橙色夕阳（简单球体）
    const sunGeometry = new THREE.SphereGeometry(300, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFF6600, // 橙色夕阳
        fog: false
    });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(3000, 1500, -5000);
    scene.add(sun);
    
    // 创建随机飘动的白云
    createClouds();
    
    // 添加微微的薄雾效果
    scene.fog = new THREE.Fog(0xC8D8E8, 3000, 12000);
}

// 创建云朵
function createClouds() {
    const cloudCount = 15; // 云朵数量
    
    for (let i = 0; i < cloudCount; i++) {
        const cloud = createCloud();
        
        // 随机位置（在天空中分布）
        const angle = Math.random() * Math.PI * 2;
        const radius = 3000 + Math.random() * 8000;
        const height = 1500 + Math.random() * 2000;
        
        cloud.mesh.position.set(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        
        // 随机速度和方向
        cloud.velocity = {
            x: (Math.random() - 0.5) * 20,
            z: (Math.random() - 0.5) * 20
        };
        
        scene.add(cloud.mesh);
        clouds.push(cloud);
    }
}

// 创建单个云朵（由多个球体组成）
function createCloud() {
    const cloudGroup = new THREE.Group();
    
    // 云朵材质（白色薄透明）
    const cloudMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.5, // 更薄
        fog: false
    });
    
    // 用多个球体组成云朵形状（更大的云）
    const sphereCount = 8 + Math.floor(Math.random() * 5);
    const baseSize = 400 + Math.random() * 300; // 更大的基础尺寸
    
    for (let i = 0; i < sphereCount; i++) {
        const size = baseSize * (0.4 + Math.random() * 0.6);
        const geometry = new THREE.SphereGeometry(size, 12, 12);
        const sphere = new THREE.Mesh(geometry, cloudMaterial.clone());
        
        // 球体在云朵内的相对位置（更扁平的分布）
        sphere.position.set(
            (Math.random() - 0.5) * baseSize * 3,
            (Math.random() - 0.5) * baseSize * 0.3, // 更扁平
            (Math.random() - 0.5) * baseSize * 3
        );
        
        // Y方向压扁
        sphere.scale.y = 0.4;
        
        cloudGroup.add(sphere);
    }
    
    // 随机旋转
    cloudGroup.rotation.y = Math.random() * Math.PI * 2;
    
    return {
        mesh: cloudGroup,
        velocity: { x: 0, z: 0 }
    };
}

// 更新云朵位置
function updateClouds(deltaTime) {
    clouds.forEach(cloud => {
        // 移动云朵
        cloud.mesh.position.x += cloud.velocity.x * deltaTime;
        cloud.mesh.position.z += cloud.velocity.z * deltaTime;
        
        // 如果云朵飘出范围，从另一边重新进入
        const maxRadius = 12000;
        const dist = Math.sqrt(cloud.mesh.position.x ** 2 + cloud.mesh.position.z ** 2);
        
        if (dist > maxRadius) {
            // 将云朵移到对面
            cloud.mesh.position.x = -cloud.mesh.position.x * 0.8;
            cloud.mesh.position.z = -cloud.mesh.position.z * 0.8;
        }
    });
}

// 创建水面（深蓝色带波浪）
function createWater() {
    // 使用平面几何体，增加细分以支持波浪
    const waterGeometry = new THREE.PlaneGeometry(
        GAME_CONFIG.SEA_RADIUS * 2, 
        GAME_CONFIG.SEA_RADIUS * 2, 
        128, 128 // 细分数，用于波浪效果
    );
    
    const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a3a5a, // 更深的深蓝色
        transparent: false,
        metalness: 0.2,
        roughness: 0.8,
        envMapIntensity: 0.3,
        flatShading: false
    });
    
    water = new THREE.Mesh(waterGeometry, waterMaterial);
    water.rotation.x = -Math.PI / 2;
    water.receiveShadow = true;
    scene.add(water);
    
    // 保存顶点原始位置用于波浪动画
    water.geometry.userData.originalPositions = water.geometry.attributes.position.array.slice();
}

// 创建光照
function createLighting() {
    // 环境光（增强漫反射，让背光面也有光）
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7); // 白色环境光，增强强度
    scene.add(ambientLight);
    
    // 半球光（天空淡蓝，海面深蓝，增强强度）
    const hemisphereLight = new THREE.HemisphereLight(
        0xAACCEE, // 天空色（淡蓝偏白）
        0x446688, // 地面色（深蓝偏亮）
        0.6
    );
    scene.add(hemisphereLight);
    
    // 夕阳直射光（暗橙色光）
    const sunLight = new THREE.DirectionalLight(0xDD7744, 0.9); // 暗橙色光
    sunLight.position.set(3000, 1500, -5000); // 与太阳位置一致，靠近海面
    sunLight.castShadow = true;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 20000;
    sunLight.shadow.camera.left = -5000;
    sunLight.shadow.camera.right = 5000;
    sunLight.shadow.camera.top = 5000;
    sunLight.shadow.camera.bottom = -5000;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);
    
    // 补充背光（增强漫反射，照亮背光面）
    const backLight = new THREE.DirectionalLight(0xAABBCC, 0.6); // 增强背光
    backLight.position.set(-3000, 4000, 4000); // 来自太阳相反方向
    scene.add(backLight);
    
    // 额外补光（从侧面照亮）
    const fillLight = new THREE.DirectionalLight(0x99AACC, 0.4); // 侧面补光
    fillLight.position.set(4000, 3000, 0); // 侧面
    scene.add(fillLight);
}

// 创建基础战舰（简单几何体）
function createBasicShip(type, isPlayer = false, isAlly = false) {
    const config = GAME_CONFIG.SHIPS[type];
    const shipGroup = new THREE.Group();
    
    // 船体
    const hullGeometry = new THREE.BoxGeometry(config.width, 20, config.length);
    const hullMaterial = new THREE.MeshPhongMaterial({ color: 0x4a4a4a });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.position.y = 10;
    hull.castShadow = true;
    hull.receiveShadow = true;
    shipGroup.add(hull);
    
    // 甲板
    const deckGeometry = new THREE.BoxGeometry(config.width - 4, 2, config.length - 10);
    const deckMaterial = new THREE.MeshPhongMaterial({ color: 0x8b7355 });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = 21;
    shipGroup.add(deck);
    
    // 舰桥
    const bridgeGeometry = new THREE.BoxGeometry(15, 25, 20);
    const bridgeMaterial = new THREE.MeshPhongMaterial({ color: 0x4a4a4a });
    const bridge = new THREE.Mesh(bridgeGeometry, bridgeMaterial);
    bridge.position.set(0, 35, config.length / 4);
    shipGroup.add(bridge);
    
    // 炮塔
    const turretPositions = config.type === 'battleship' ? 
        [[0, 25, -config.length/3], [0, 25, 0], [0, 25, config.length/3]] :
        [[0, 25, -config.length/4], [0, 25, config.length/4]];
    
    turretPositions.forEach((pos, i) => {
        if (i < config.turretCount) {
            const turretGeometry = new THREE.CylinderGeometry(8, 8, 10, 16);
            const turretMaterial = new THREE.MeshPhongMaterial({ color: 0x3a3a3a });
            const turret = new THREE.Mesh(turretGeometry, turretMaterial);
            turret.position.set(pos[0], pos[1], pos[2]);
            shipGroup.add(turret);
            
            // 炮管
            const barrelGeometry = new THREE.CylinderGeometry(1, 1, 25, 8);
            const barrelMaterial = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
            const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
            barrel.rotation.x = Math.PI / 2;
            barrel.position.set(0, 0, 15);
            turret.add(barrel);
        }
    });
    
    // 烟囱
    const funnelGeometry = new THREE.CylinderGeometry(3, 4, 20, 12);
    const funnelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const funnel = new THREE.Mesh(funnelGeometry, funnelMaterial);
    funnel.position.set(0, 30, config.length / 6);
    shipGroup.add(funnel);
    
    // 战舰数据
    const ship = {
        mesh: shipGroup,
        config: { ...config },
        hp: config.hp,
        torpedoCount: config.torpedoCount,
        isPlayer: isPlayer,
        isAlly: isAlly,
        isEnemy: !isPlayer && !isAlly,
        speed: 0,
        maxSpeed: config.speed,
        turnSpeed: 0,
        lastFireTime: 0,
        lastTorpedoTime: 0,
        target: null,
        sunk: false
    };
    
    return ship;
}

// 加载GLB模型（支持文件路径或ArrayBuffer）
function loadGLBModel(source, scale = 1) {
    return new Promise((resolve, reject) => {
        const loader = new THREE.GLTFLoader();
        
        const onLoad = (gltf) => {
            const model = gltf.scene;
            model.scale.set(scale, scale, scale);
            
            // 启用阴影
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            resolve(model);
        };
        
        const onProgress = (progress) => {
            // 加载进度（静默）
        };
        
        const onError = (error) => {
            console.error('GLB加载失败:', error);
            reject(error);
        };
        
        if (typeof source === 'string') {
            loader.load(source, onLoad, onProgress, onError);
        } else {
            // 直接解析ArrayBuffer
            loader.parse(source, '', onLoad, onError);
        }
    });
}

// 使用Fetch加载GLB文件（绕过CORS限制）
async function fetchGLBModel(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return arrayBuffer;
    } catch (error) {
        console.error('Fetch GLB失败:', error);
        throw error;
    }
}

// 从Base64加载GLB模型
async function loadGLBFromBase64(base64String, scale = 1) {
    return new Promise((resolve, reject) => {
        // 提取Base64数据部分
        const base64Data = base64String.split(',')[1];
        
        // 解码Base64为二进制
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        const loader = new THREE.GLTFLoader();
        loader.parse(bytes.buffer, '', (gltf) => {
            const model = gltf.scene;
            
            // 计算模型边界框
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());
            
            // 将模型中心移到原点
            model.position.sub(center);
            // 将模型底部移到y=30（战舰底部30米高度）
            model.position.y += size.y / 2 + 30;
            
            // 应用缩放
            model.scale.set(scale, scale, scale);
            
            // 创建容器Group，用于分离模型内部旋转和外部控制旋转
            const container = new THREE.Group();
            
            // 修正模型朝向（GLB模型默认Y轴逆时针旋转90度）
            // 在模型上设置修正旋转，使船头朝向+Z
            model.rotation.y = -Math.PI / 2; // 顺时针90度修正
            
            // 模型向右偏移100米修正中心位置
            model.position.x += 150;
            
            container.add(model);
            
            // 启用阴影并设置材质
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // 为模型添加材质
                    if (child.material) {
                        // 钢铁材质（深灰色金属感）
                        child.material = new THREE.MeshStandardMaterial({
                            color: 0x4a4a4a,
                            metalness: 0.8,
                            roughness: 0.3
                        });
                        
                        // 如果是甲板（通常在顶部），使用木质材质
                        if (child.name && (child.name.toLowerCase().includes('deck') || 
                            child.name.toLowerCase().includes('floor'))) {
                            child.material = new THREE.MeshStandardMaterial({
                                color: 0x8b7355,
                                metalness: 0.0,
                                roughness: 0.9
                            });
                        }
                    }
                }
            });
            
            resolve(container); // 返回容器而不是模型
        }, (error) => {
            console.error('Base64 GLB加载失败:', error);
            reject(error);
        });
    });
}

// 创建战舰（支持GLB模型）
async function createShip(type, isPlayer = false, isAlly = false) {
    const config = GAME_CONFIG.SHIPS[type];
    
    // 战列舰使用George GLB模型（从Base64加载）
    if (config.type === 'battleship') {
        try {
            // 使用全局的GEORGE_GLB_BASE64变量，缩放600倍（240*2.5）
            const model = await loadGLBFromBase64(GEORGE_GLB_BASE64, 600);
            
            // 战舰数据
            const ship = {
                mesh: model,
                config: { ...config },
                hp: config.hp,
                torpedoCount: config.torpedoCount,
                isPlayer: isPlayer,
                isAlly: isAlly,
                isEnemy: !isPlayer && !isAlly,
                speed: 0,
                maxSpeed: config.speed,
                turnSpeed: 0,
                lastFireTime: 0,
                lastTorpedoTime: 0,
                target: null,
                sunk: false
            };
            
            return ship;
        } catch (error) {
            console.warn('GLB模型加载失败，使用基础模型:', error);
            return createBasicShip(type, isPlayer, isAlly);
        }
    }
    
    // 驱逐舰使用基础模型
    return createBasicShip(type, isPlayer, isAlly);
}

// 为玩家战舰添加闪烁红星标识
function addPlayerMarker(ship) {
    // 创建五角星形状（更大尺寸）
    const starShape = new THREE.Shape();
    const outerRadius = 40; // 增大到40
    const innerRadius = 16; // 增大到16
    const points = 5;
    
    for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
            starShape.moveTo(x, y);
        } else {
            starShape.lineTo(x, y);
        }
    }
    starShape.closePath();
    
    // 挤出几何体创建3D星星
    const extrudeSettings = {
        depth: 5,
        bevelEnabled: true,
        bevelThickness: 2,
        bevelSize: 2,
        bevelSegments: 1
    };
    
    const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial({ // 使用BasicMaterial，不受光照影响
        color: 0xff0000,
        transparent: true,
        opacity: 1.0
    });
    
    const star = new THREE.Mesh(geometry, material);
    
    // 旋转使星星朝向相机（垂直站立）
    star.rotation.x = 0;
    star.rotation.y = Math.PI; // 面向后方（相机方向）
    
    // 位置：船头前方60米，高度60米
    const shipLength = ship.config.length || 250;
    star.position.set(0, 60, shipLength / 2 + 60); // 船头前方60米，高度60米
    
    // 添加到战舰
    ship.mesh.add(star);
    
    // 保存引用用于闪烁动画
    ship.marker = star;
}

// 初始化战斗（异步）
async function initBattle() {
    // 清除旧的战舰
    gameState.allShips.forEach(ship => {
        scene.remove(ship.mesh);
    });
    gameState.allShips = [];
    gameState.enemyShips = [];
    
    const radius = GAME_CONFIG.SEA_RADIUS * 0.6;
    
    // 创建玩家战舰（衣阿华）- 左下角
    gameState.playerShip = await createShip('IOWA', true);
    gameState.playerShip.mesh.position.set(-radius * 0.9, gameState.playerShip.mesh.position.y, radius * 0.9);
    // 朝向东北（右上角敌方）
    gameState.playerShip.mesh.rotation.y = Math.PI * 3 / 4;
    scene.add(gameState.playerShip.mesh);
    gameState.allShips.push(gameState.playerShip);
    
    // 创建友方战舰（弗莱彻）- 玩家左前方，更靠近敌舰，在镜头可见范围内
    gameState.allyShip = await createShip('FLETCHER', false, true);
    // 放在衣阿华左前方，距离适中便于镜头捕捉
    const allyForwardOffset = 700;  // 前方偏移700米
    const allyLeftOffset = 200;      // 左侧偏移200米（减少左偏，更靠近视线中心）
    const allyAngle = Math.PI * 3 / 4; // 友舰朝向东北
    // 计算左前方位置：基于己舰位置 + 朝向敌舰方向的偏移
    gameState.allyShip.mesh.position.set(
        -radius * 0.9 - allyLeftOffset,    // 向左偏移200米
        0, 
        radius * 0.9 - allyForwardOffset   // 向前偏移700米（更靠近敌舰）
    );
    gameState.allyShip.mesh.rotation.y = allyAngle; // 驱逐舰直接设置旋转
    scene.add(gameState.allyShip.mesh);
    gameState.allShips.push(gameState.allyShip);
    
    // 创建敌方战舰（俾斯麦）- 右上角对角
    const enemy1 = await createShip('BISMARCK', false, false);
    enemy1.mesh.position.set(radius * 0.9, enemy1.mesh.position.y, -radius * 0.9);
    // 朝向西南（左下角友方）
    enemy1.mesh.rotation.y = -Math.PI * 3 / 4;
    scene.add(enemy1.mesh);
    gameState.allShips.push(enemy1);
    gameState.enemyShips.push(enemy1);
    
    // 创建敌方驱逐舰（阳炎）x3 - 分散在战列舰附近
    const enemy3 = await createShip('KAGERO', false, false);
    enemy3.mesh.position.set(radius * 0.8, 0, -radius * 0.95);
    enemy3.mesh.rotation.y = -Math.PI * 3 / 4; // 驱逐舰直接设置旋转，朝向西南
    scene.add(enemy3.mesh);
    gameState.allShips.push(enemy3);
    gameState.enemyShips.push(enemy3);
    
    const enemy4 = await createShip('KAGERO', false, false);
    enemy4.mesh.position.set(radius * 0.95, 0, -radius * 0.8);
    enemy4.mesh.rotation.y = -Math.PI * 3 / 4; // 驱逐舰直接设置旋转，朝向西南
    scene.add(enemy4.mesh);
    gameState.allShips.push(enemy4);
    gameState.enemyShips.push(enemy4);
    
    const enemy5 = await createShip('KAGERO', false, false);
    enemy5.mesh.position.set(radius * 0.6, 0, -radius * 0.75);
    enemy5.mesh.rotation.y = -Math.PI * 3 / 4; // 驱逐舰直接设置旋转，朝向西南
    scene.add(enemy5.mesh);
    gameState.allShips.push(enemy5);
    gameState.enemyShips.push(enemy5);
    
    // 设置初始相机位置
    updateCamera();
}

// 更新相机位置
function updateCamera() {
    if (!gameState.playerShip || gameState.playerShip.sunk) return;
    
    const ship = gameState.playerShip;
    const shipPos = ship.mesh.position;
    const shipRot = ship.mesh.rotation.y;
    
    // 计算相机位置（围绕战舰旋转）
    const distance = 200; // 距离战舰的水平距离
    const height = 80;    // 相机高度
    
    // 相机围绕战舰旋转：战舰朝向 + 180度（默认在后方） + 用户旋转偏移
    const cameraAngle = shipRot + Math.PI + gameState.camera.rotationX;
    
    camera.position.x = shipPos.x + Math.sin(cameraAngle) * distance;
    camera.position.z = shipPos.z + Math.cos(cameraAngle) * distance;
    camera.position.y = shipPos.y + height;
    
    // 计算准星指向的方向（从相机穿过战舰，延伸到远处）
    // 瞄准方向是相机角度的反方向
    const aimAngle = cameraAngle - Math.PI;
    
    // 相机看向战舰前方远处的一个点（沿着瞄准方向）
    const lookDistance = 1000; // 看向1000米远处
    const lookAtX = shipPos.x + Math.sin(aimAngle) * lookDistance;
    const lookAtZ = shipPos.z + Math.cos(aimAngle) * lookDistance;
    const lookAtY = shipPos.y + 30 - gameState.crosshair.screenY * 2; // 垂直准星调整
    
    camera.lookAt(lookAtX, lookAtY, lookAtZ);
}

// 设置触摸控制
function setupTouchControls() {
    const canvas = document.getElementById('gameCanvas');
    
    // 准星当前位置（相对于屏幕中心）- 准星始终水平居中，只能上下移动
    gameState.crosshair.screenY = 0;
    
    // 设置初始位置
    updateCrosshairPosition();
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        gameState.touch.startX = touch.clientX;
        gameState.touch.startY = touch.clientY;
        gameState.touch.lastX = touch.clientX;
        gameState.touch.lastY = touch.clientY;
        gameState.touch.isDragging = true;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!gameState.touch.isDragging) return;
        
        const touch = e.touches[0];
        const deltaX = touch.clientX - gameState.touch.lastX;
        const deltaY = touch.clientY - gameState.touch.lastY;
        
        // 水平滑动只控制视角旋转（准星保持在中心）
        gameState.camera.targetRotationX += deltaX * 0.005;
        
        // 垂直滑动控制准星上下移动
        gameState.crosshair.screenY += deltaY;
        gameState.crosshair.screenY = Math.max(-window.innerHeight / 2 + 50, 
            Math.min(window.innerHeight / 2 - 50, gameState.crosshair.screenY));
        
        // 更新准星UI位置（只更新Y位置，X始终为0）
        updateCrosshairPosition();
        
        gameState.touch.lastX = touch.clientX;
        gameState.touch.lastY = touch.clientY;
    });
    
    canvas.addEventListener('touchend', () => {
        gameState.touch.isDragging = false;
    });
    
    // 鼠标控制（用于PC测试）
    let mouseDown = false;
    canvas.addEventListener('mousedown', (e) => {
        mouseDown = true;
        gameState.touch.lastX = e.clientX;
        gameState.touch.lastY = e.clientY;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!mouseDown) return;
        const deltaX = e.clientX - gameState.touch.lastX;
        const deltaY = e.clientY - gameState.touch.lastY;
        
        // 水平滑动只控制视角旋转（准星保持在中心）
        gameState.camera.targetRotationX += deltaX * 0.005;
        
        // 垂直滑动控制准星上下移动
        gameState.crosshair.screenY += deltaY;
        gameState.crosshair.screenY = Math.max(-window.innerHeight / 2 + 50, 
            Math.min(window.innerHeight / 2 - 50, gameState.crosshair.screenY));
        
        // 更新准星UI位置（只更新Y位置，X始终为0）
        updateCrosshairPosition();
        
        gameState.touch.lastX = e.clientX;
        gameState.touch.lastY = e.clientY;
    });
    
    canvas.addEventListener('mouseup', () => {
        mouseDown = false;
    });
}

// 更新准星UI位置
function updateCrosshairPosition() {
    const crosshair = document.getElementById('crosshair');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // 准星始终保持在屏幕水平中心，只上下移动
    crosshair.style.left = centerX + 'px';
    crosshair.style.top = (centerY + gameState.crosshair.screenY) + 'px';
}

// 设置按钮控制
function setupButtonControls() {
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnFire = document.getElementById('btnFire');
    const btnTorpedo = document.getElementById('btnTorpedo');
    
    // 左转
    btnLeft.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.playerShip) gameState.playerShip.turnSpeed = gameState.playerShip.config.turnSpeed;
    });
    btnLeft.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (gameState.playerShip) gameState.playerShip.turnSpeed = 0;
    });
    btnLeft.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        if (gameState.playerShip) gameState.playerShip.turnSpeed = 0;
    });
    btnLeft.addEventListener('mousedown', () => {
        if (gameState.playerShip) gameState.playerShip.turnSpeed = gameState.playerShip.config.turnSpeed;
    });
    btnLeft.addEventListener('mouseup', () => {
        if (gameState.playerShip) gameState.playerShip.turnSpeed = 0;
    });
    btnLeft.addEventListener('mouseleave', () => {
        if (gameState.playerShip) gameState.playerShip.turnSpeed = 0;
    });
    
    // 右转
    btnRight.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameState.playerShip) gameState.playerShip.turnSpeed = -gameState.playerShip.config.turnSpeed;
    });
    btnRight.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (gameState.playerShip) gameState.playerShip.turnSpeed = 0;
    });
    btnRight.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        if (gameState.playerShip) gameState.playerShip.turnSpeed = 0;
    });
    btnRight.addEventListener('mousedown', () => {
        if (gameState.playerShip) gameState.playerShip.turnSpeed = -gameState.playerShip.config.turnSpeed;
    });
    btnRight.addEventListener('mouseup', () => {
        if (gameState.playerShip) gameState.playerShip.turnSpeed = 0;
    });
    btnRight.addEventListener('mouseleave', () => {
        if (gameState.playerShip) gameState.playerShip.turnSpeed = 0;
    });
    
    // 开火
    btnFire.addEventListener('touchstart', (e) => {
        e.preventDefault();
        playerFire();
    });
    btnFire.addEventListener('mousedown', () => {
        playerFire();
    });
    
    // 鱼雷
    btnTorpedo.addEventListener('touchstart', (e) => {
        e.preventDefault();
        playerFireTorpedo();
    });
    btnTorpedo.addEventListener('mousedown', () => {
        playerFireTorpedo();
    });
}

// 玩家开火
function playerFire() {
    if (!gameState.playerShip || gameState.playerShip.sunk) return;
    
    const now = Date.now() / 1000;
    if (now - gameState.playerShip.lastFireTime < 2) return; // 2秒冷却
    gameState.playerShip.lastFireTime = now;
    
    const target = findTargetInCrosshair();
    fireShells(gameState.playerShip, target);
    
    // 触发冷却动画
    startCooldown('btnFire', 2);
}

// 玩家发射鱼雷
function playerFireTorpedo() {
    if (!gameState.playerShip || gameState.playerShip.sunk) return;
    if (gameState.playerShip.torpedoCount <= 0) return;
    
    const now = Date.now() / 1000;
    if (now - gameState.playerShip.lastTorpedoTime < 2) return; // 2秒冷却
    gameState.playerShip.lastTorpedoTime = now;
    
    const salvo = Math.min(gameState.playerShip.config.torpedoSalvo, gameState.playerShip.torpedoCount);
    gameState.playerShip.torpedoCount -= salvo;
    
    updateTorpedoDisplay();
    fireTorpedoes(gameState.playerShip, salvo);
    
    // 触发冷却动画
    startCooldown('btnTorpedo', 2);
}

// 按钮冷却动画
function startCooldown(btnId, duration) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    
    // 添加冷却状态
    btn.classList.add('cooling');
    
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;
    
    // 动画循环
    function updateProgress() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        
        // 从0度到360度
        const degrees = progress * 360;
        btn.style.setProperty('--progress', degrees + 'deg');
        
        if (progress < 1) {
            requestAnimationFrame(updateProgress);
        } else {
            // 冷却结束
            btn.classList.remove('cooling');
            btn.style.setProperty('--progress', '360deg');
        }
    }
    
    requestAnimationFrame(updateProgress);
}

// 寻找准星中的目标
function findTargetInCrosshair() {
    if (!gameState.playerShip) return null;
    
    const shipPos = gameState.playerShip.mesh.position;
    const shipRot = gameState.playerShip.mesh.rotation.y;
    
    // 计算瞄准方向（与相机lookAt方向一致）
    const cameraAngle = shipRot + Math.PI + gameState.camera.rotationX;
    const aimAngle = cameraAngle - Math.PI; // 简化：shipRot + camera.rotationX
    
    // 射线方向（从相机位置指向远处瞄准点）
    const lookDistance = 1000;
    const lookAtX = shipPos.x + Math.sin(aimAngle) * lookDistance;
    const lookAtZ = shipPos.z + Math.cos(aimAngle) * lookDistance;
    const lookAtY = shipPos.y + 30 - gameState.crosshair.screenY * 2;
    
    const rayDirection = new THREE.Vector3(
        lookAtX - camera.position.x,
        lookAtY - camera.position.y,
        lookAtZ - camera.position.z
    ).normalize();
    
    let closestTarget = null;
    let closestDistance = Infinity;
    let closestAngleDiff = Infinity;
    
    gameState.enemyShips.forEach(enemy => {
        if (enemy.sunk) return;
        
        const enemyPos = enemy.mesh.position;
        const distance = shipPos.distanceTo(enemyPos);
        
        // 计算敌舰相对于相机的方向
        const toEnemy = new THREE.Vector3().subVectors(enemyPos, camera.position).normalize();
        
        // 计算角度差（点积）
        const angleDiff = Math.acos(Math.max(-1, Math.min(1, rayDirection.dot(toEnemy))));
        
        // 如果敌舰在准星附近（角度差小于1度，约0.0175弧度）
        if (angleDiff < 0.0175 && distance < closestDistance) {
            closestDistance = distance;
            closestAngleDiff = angleDiff;
            closestTarget = enemy;
        }
    });
    
    // 更新UI
    const targetInfo = document.getElementById('targetInfo');
    if (closestTarget) {
        targetInfo.style.display = 'block';
        targetInfo.textContent = `${closestTarget.config.name}: ${Math.round(closestDistance)}m`;
        // 更新目标信息显示位置（准星右侧）
        const crosshair = document.getElementById('crosshair');
        const rect = crosshair.getBoundingClientRect();
        targetInfo.style.left = (rect.right + 10) + 'px';
        targetInfo.style.top = rect.top + 'px';
    } else {
        targetInfo.style.display = 'none';
    }
    
    return closestTarget;
}

// 发射炮弹
function fireShells(ship, target) {
    const shellCount = ship.config.turretCount * 4;
    
    // 播放炮声（只在玩家发射时播放，避免太吵）
    if (ship.isPlayer) {
        playShellSound();
    }
    
    // 4发一组发射
    for (let i = 0; i < shellCount; i++) {
        const groupDelay = Math.floor(i / 4) * 100; // 每组之间间隔100ms
        
        setTimeout(() => {
            if (ship.sunk) return;
            
            const shell = createShell(ship, target, i);
            gameState.shells.push(shell);
            
            // 每组发射时播放一次炮声
            if (ship.isPlayer && i % 4 === 0 && i > 0) {
                playShellSound();
            }
        }, groupDelay);
    }
}

// 创建炮弹
function createShell(ship, target, index) {
    // 橙色圆锥体（炮弹）
    const geometry = new THREE.ConeGeometry(2, 8, 8);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xff6600,
        emissive: 0xff3300,
        emissiveIntensity: 0.3
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    const shipPos = ship.mesh.position;
    
    // 计算炮塔位置（前炮塔或后炮塔）
    const turretCount = ship.config.turretCount || 3;
    const turretIndex = index % turretCount;
    const turretSpacing = ship.config.length / 3;
    const turretOffset = turretIndex === 0 ? ship.config.length / 3 : 
                         turretIndex === 1 ? 0 : 
                         -ship.config.length / 3;
    
    // 炮弹从炮塔位置发射（战列舰高度50米+炮塔高度30米）
    const shellHeight = ship.mesh.position.y + 30; // 相对于战舰的炮塔高度
    
    // 玩家船的瞄准方向：从相机穿过战舰延伸出去
    let aimAngle;
    if (ship.isPlayer) {
        // 相机角度
        const cameraAngle = ship.mesh.rotation.y + Math.PI + gameState.camera.rotationX;
        // 瞄准方向是相机角度的反方向（从战舰向外延伸）
        aimAngle = cameraAngle - Math.PI;
    } else {
        // AI船直接朝向战舰前方
        aimAngle = ship.mesh.rotation.y;
    }
    
    mesh.position.set(
        shipPos.x + Math.sin(aimAngle) * turretOffset,
        shellHeight,
        shipPos.z + Math.cos(aimAngle) * turretOffset
    );
    
    scene.add(mesh);
    
    // 记录发射时的目标战舰（用于命中判定）
    const initialTarget = target;
    
    // 计算目标点：如果瞄准了敌舰，计算预测位置（考虑敌舰移动）
    const targetPos = new THREE.Vector3();
    if (target) {
        // 先计算到当前位置的距离，用于估算飞行时间
        const currentDist = Math.sqrt(
            Math.pow(target.mesh.position.x - mesh.position.x, 2) +
            Math.pow(target.mesh.position.z - mesh.position.z, 2)
        );
        const estimatedFlightTime = currentDist / GAME_CONFIG.SHELL_SPEED;
        
        // 计算敌舰在飞行期间的移动量
        const targetSpeed = target.speed * 0.5; // 与移动逻辑一致
        const targetRot = target.mesh.rotation.y;
        const moveX = Math.sin(targetRot) * targetSpeed * estimatedFlightTime;
        const moveZ = Math.cos(targetRot) * targetSpeed * estimatedFlightTime;
        
        // 炮弹飞向敌舰的预测位置
        targetPos.x = target.mesh.position.x + moveX;
        targetPos.z = target.mesh.position.z + moveZ;
        targetPos.y = 0;
        
        // 调试：打印预测信息
        if (ship.isPlayer) {
            console.log(`[预测] 敌舰位置: (${target.mesh.position.x.toFixed(0)}, ${target.mesh.position.z.toFixed(0)}) | 速度: ${targetSpeed.toFixed(1)} | 方向: ${(targetRot * 180 / Math.PI).toFixed(0)}° | 移动: (${moveX.toFixed(0)}, ${moveZ.toFixed(0)}) | 预测位置: (${targetPos.x.toFixed(0)}, ${targetPos.z.toFixed(0)})`);
        }
        
        // 添加很小的随机散布（±10米），精确打击
        targetPos.x += (Math.random() - 0.5) * 20;
        targetPos.z += (Math.random() - 0.5) * 20;
    } else {
        // 没有目标时，按瞄准方向1500米
        const lookDistance = 1500;
        targetPos.x = shipPos.x + Math.sin(aimAngle) * lookDistance;
        targetPos.z = shipPos.z + Math.cos(aimAngle) * lookDistance;
        targetPos.y = 0;
        
        // 没有目标时，散布±50米
        targetPos.x += (Math.random() - 0.5) * 100;
        targetPos.z += (Math.random() - 0.5) * 100;
    }    
    // 计算抛物线轨迹
    const distance = Math.sqrt(
        Math.pow(targetPos.x - mesh.position.x, 2) + 
        Math.pow(targetPos.z - mesh.position.z, 2)
    );
    
    // 计算飞行时间（水平距离 / 水平速度）
    const flightTime = distance / GAME_CONFIG.SHELL_SPEED;
    
    // 炮弹唯一编号
    const shellId = `SHELL_${Date.now()}_${index}`;
    
    // 水平速度分量
    const horizontalVelocity = GAME_CONFIG.SHELL_SPEED;
    const angle = Math.atan2(targetPos.x - mesh.position.x, targetPos.z - mesh.position.z);
    
    // 垂直初速度计算（考虑初始高度和目标高度差）
    const startHeight = shellHeight;
    const targetHeight = 0; // 水面高度
    const heightDiff = targetHeight - startHeight; // 负值表示需要下降
    
    // 使用抛物线公式: h = v0*t - 0.5*g*t²
    // heightDiff = v0*t - 0.5*g*t²
    // v0 = (heightDiff + 0.5*g*t²) / t
    const verticalVelocity = (heightDiff + 0.5 * GAME_CONFIG.GRAVITY * Math.pow(flightTime, 2)) / flightTime;
    
    const velocity = new THREE.Vector3(
        Math.sin(angle) * horizontalVelocity,
        verticalVelocity,
        Math.cos(angle) * horizontalVelocity
    );
    
    // 己舰发射炮弹时打印日志
    if (ship.isPlayer) {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0] + '.' + now.getMilliseconds().toString().padStart(3, '0');
        const targetName = target ? target.config.name : '无目标';
        console.log(`${timeStr} | 炮弹: ${shellId} | 目标: ${targetName} | 距离: ${distance.toFixed(1)}米 | 预计飞行: ${flightTime.toFixed(2)}秒`);
    }
    
    return {
        mesh: mesh,
        velocity: velocity,
        targetPos: targetPos,
        target: target,
        initialTarget: initialTarget, // 记录发射时的目标
        distance: distance,
        flightTime: flightTime, // 预计飞行时间
        startTime: Date.now() / 1000,
        ship: ship,
        shellId: shellId, // 炮弹编号
        isPlayerShell: ship.isPlayer, // 是否玩家炮弹
        targetName: target ? target.config.name : '无目标' // 目标名称
    };
}

// 发射鱼雷
function fireTorpedoes(ship, count) {
    // 播放鱼雷发射音效（只在玩家发射时播放）
    if (ship.isPlayer) {
        playTorpedoSound();
    }
    
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            if (ship.sunk) return;
            const torpedo = createTorpedo(ship, i, count);
            gameState.torpedoes.push(torpedo);
        }, i * 200);
    }
}

// 创建鱼雷
function createTorpedo(ship, index, total) {
    const geometry = new THREE.CylinderGeometry(1, 1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0x0066ff });
    const mesh = new THREE.Mesh(geometry, material);
    
    const shipPos = ship.mesh.position;
    // 使用相机旋转角度（准星方向）
    const shipRot = ship.mesh.rotation.y + (ship.isPlayer ? gameState.camera.rotationX : 0);
    
    // 扇形散布
    const spreadAngle = (index - (total - 1) / 2) * 0.05;
    const angle = shipRot + spreadAngle;
    
    mesh.position.set(
        shipPos.x + Math.sin(angle) * (ship.config.length / 2 + 10),
        2,
        shipPos.z + Math.cos(angle) * (ship.config.length / 2 + 10)
    );
    mesh.rotation.y = angle;
    
    scene.add(mesh);
    
    const velocity = new THREE.Vector3(
        Math.sin(angle) * GAME_CONFIG.TORPEDO_SPEED,
        0,
        Math.cos(angle) * GAME_CONFIG.TORPEDO_SPEED
    );
    
    return {
        mesh: mesh,
        velocity: velocity,
        startTime: Date.now() / 1000,
        ship: ship
    };
}

// 创建爆炸效果
function createExplosion(position, scale = 1) {
    const geometry = new THREE.SphereGeometry(10 * scale, 16, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0xff4400,
        transparent: true,
        opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    scene.add(mesh);
    
    gameState.explosions.push({
        mesh: mesh,
        startTime: Date.now() / 1000,
        duration: 1
    });
}

// 创建水花效果
function createSplash(position) {
    const geometry = new THREE.CylinderGeometry(5, 15, 20, 16);
    const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    scene.add(mesh);
    
    gameState.splashes.push({
        mesh: mesh,
        startTime: Date.now() / 1000,
        duration: 2
    });
}

// 创建战舰尾流
function createWake(ship) {
    if (ship.sunk || ship.speed <= 0) return;
    
    const shipPos = ship.mesh.position;
    const shipRot = ship.mesh.rotation.y;
    const shipLength = ship.config.length || 200;
    const shipWidth = ship.config.width || 30;
    
    // 尾流从船尾生成
    const wakeX = shipPos.x - Math.sin(shipRot) * (shipLength / 2 + 20);
    const wakeZ = shipPos.z - Math.cos(shipRot) * (shipLength / 2 + 20);
    
    // 创建V字形尾流（两条白色带状）
    const wakeGroup = new THREE.Group();
    
    // 尾流宽度基于船宽，但有最小值
    const wakeWidth = Math.max(shipWidth, 30);
    
    // 左侧尾流
    const leftWake = createWakeStrip(wakeWidth * 0.5);
    leftWake.position.set(-wakeWidth * 0.6, 0, 0);
    leftWake.rotation.y = 0.2; // 向外扩散
    wakeGroup.add(leftWake);
    
    // 右侧尾流
    const rightWake = createWakeStrip(wakeWidth * 0.5);
    rightWake.position.set(wakeWidth * 0.6, 0, 0);
    rightWake.rotation.y = -0.2; // 向外扩散
    wakeGroup.add(rightWake);
    
    // 中央泡沫
    const centerFoam = createWakeFoam(wakeWidth);
    wakeGroup.add(centerFoam);
    
    wakeGroup.position.set(wakeX, 2, wakeZ);
    wakeGroup.rotation.y = shipRot + Math.PI;
    
    scene.add(wakeGroup);
    
    wakes.push({
        mesh: wakeGroup,
        startTime: Date.now() / 1000,
        duration: 3, // 尾流持续3秒
        initialOpacity: 0.8
    });
}

// 创建单条尾流带
function createWakeStrip(width) {
    const geometry = new THREE.PlaneGeometry(width, 120); // 加长尾流
    const material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const strip = new THREE.Mesh(geometry, material);
    strip.rotation.x = -Math.PI / 2;
    strip.position.z = 60;
    return strip;
}

// 创建尾流泡沫
function createWakeFoam(width) {
    const geometry = new THREE.PlaneGeometry(width, 80); // 加大泡沫
    const material = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
    });
    const foam = new THREE.Mesh(geometry, material);
    foam.rotation.x = -Math.PI / 2;
    foam.position.z = 30;
    foam.position.y = 1;
    return foam;
}

// 更新尾流
function updateWakes(deltaTime) {
    const now = Date.now() / 1000;
    
    wakes = wakes.filter(wake => {
        const progress = (now - wake.startTime) / wake.duration;
        
        if (progress >= 1) {
            scene.remove(wake.mesh);
            return false;
        }
        
        // 逐渐消散：透明度降低，尺寸扩大
        wake.mesh.traverse(child => {
            if (child.material) {
                child.material.opacity = wake.initialOpacity * (1 - progress);
            }
        });
        
        // 尾流扩散
        const scale = 1 + progress * 0.5;
        wake.mesh.scale.set(scale, 1, scale);
        
        return true;
    });
}

// 更新炮弹
function updateShells(deltaTime) {
    const now = Date.now() / 1000;
    
    gameState.shells = gameState.shells.filter(shell => {
        // 抛物线运动
        shell.mesh.position.add(shell.velocity.clone().multiplyScalar(deltaTime));
        
        // 重力影响
        shell.velocity.y -= GAME_CONFIG.GRAVITY * deltaTime;
        
        // 圆锥体旋转对准飞行方向
        const flyDirection = shell.velocity.clone().normalize();
        
        // 使用lookAt方法更可靠地定向
        const currentPos = shell.mesh.position.clone();
        const targetLookPos = currentPos.clone().add(flyDirection);
        shell.mesh.lookAt(targetLookPos);
        
        // 调整90度，因为ConeGeometry默认朝向+Y轴
        shell.mesh.rotateX(Math.PI / 2);
        
        // 命中判定3：飞行中碰撞到敌舰，100%命中
        let hitDuringFlight = false;
        gameState.allShips.forEach(ship => {
            if (ship === shell.ship || ship.sunk) return;
            
            // 友军不互相伤害
            const shellSide = shell.ship.isAlly || shell.ship.isPlayer;
            const shipSide = ship.isAlly || ship.isPlayer;
            if (shellSide === shipSide) return;
            
            // 检测碰撞（炮弹与战舰中心距离<30米）
            const distToShip = shell.mesh.position.distanceTo(ship.mesh.position);
            if (distToShip < 30 && shell.mesh.position.y > 2 && shell.mesh.position.y < 50) {
                // 飞行中直接命中，100%概率
                const damage = shell.ship.config.shellDamage;
                ship.hp -= damage;
                createExplosion(ship.mesh.position, 1.5);
                
                if (ship.hp <= 0) {
                    sinkShip(ship);
                }
                
                hitDuringFlight = true;
            }
        });
        
        if (hitDuringFlight) {
            // 己舰炮弹命中日志
            if (shell.isPlayerShell) {
                const now = new Date();
                const timeStr = now.toTimeString().split(' ')[0] + '.' + now.getMilliseconds().toString().padStart(3, '0');
                const actualFlightTime = (Date.now() / 1000 - shell.startTime).toFixed(2);
                console.log(`${timeStr} | 炮弹: ${shell.shellId} | 目标: ${shell.targetName} | 飞行: ${actualFlightTime}秒 | [命中]`);
            }
            scene.remove(shell.mesh);
            return false;
        }
        
        // 检查是否到达水面
        if (shell.velocity.y < 0 && shell.mesh.position.y <= 5) {
            let hitTarget = false;
            let hitShipName = '';
            
            // 命中判定1：发射时瞄准的敌舰，80%概率命中
            if (shell.initialTarget && !shell.initialTarget.sunk) {
                const distToInitialTarget = Math.sqrt(
                    Math.pow(shell.mesh.position.x - shell.initialTarget.mesh.position.x, 2) +
                    Math.pow(shell.mesh.position.z - shell.initialTarget.mesh.position.z, 2)
                );
                
                // 调试：打印落水距离
                if (shell.isPlayerShell) {
                    console.log(`[调试] 炮弹落水位置: (${shell.mesh.position.x.toFixed(0)}, ${shell.mesh.position.z.toFixed(0)}) | 敌舰位置: (${shell.initialTarget.mesh.position.x.toFixed(0)}, ${shell.initialTarget.mesh.position.z.toFixed(0)}) | 距离: ${distToInitialTarget.toFixed(1)}米`);
                }
                
                // 如果距离初始目标<330米，80%概率命中（考虑移动预测误差）
                if (distToInitialTarget < 330 && Math.random() < 0.8) {
                    const damage = shell.ship.config.shellDamage;
                    shell.initialTarget.hp -= damage;
                    createExplosion(shell.initialTarget.mesh.position, 1.5);
                    
                    if (shell.initialTarget.hp <= 0) {
                        sinkShip(shell.initialTarget);
                    }
                    
                    hitTarget = true;
                    hitShipName = shell.initialTarget.config.name;
                }
            }
            
            // 命中判定2：100米内的任意敌舰，60%概率命中（如果判定1未命中）
            if (!hitTarget) {
                gameState.allShips.forEach(ship => {
                    if (ship === shell.ship || ship.sunk || hitTarget) return;
                    
                    // 友军不互相伤害
                    const shellSide = shell.ship.isAlly || shell.ship.isPlayer;
                    const shipSide = ship.isAlly || ship.isPlayer;
                    if (shellSide === shipSide) return;
                    
                    const distToShip = Math.sqrt(
                        Math.pow(shell.mesh.position.x - ship.mesh.position.x, 2) +
                        Math.pow(shell.mesh.position.z - ship.mesh.position.z, 2)
                    );
                    
                    // 100米内，60%概率命中
                    if (distToShip < 100 && Math.random() < 0.6) {
                        const damage = shell.ship.config.shellDamage;
                        ship.hp -= damage;
                        createExplosion(ship.mesh.position, 1.5);
                        
                        if (ship.hp <= 0) {
                            sinkShip(ship);
                        }
                        
                        hitTarget = true;
                        hitShipName = ship.config.name;
                    }
                });
            }
            
            // 己舰炮弹结果日志
            if (shell.isPlayerShell) {
                const now = new Date();
                const timeStr = now.toTimeString().split(' ')[0] + '.' + now.getMilliseconds().toString().padStart(3, '0');
                const actualFlightTime = (Date.now() / 1000 - shell.startTime).toFixed(2);
                if (hitTarget) {
                    console.log(`${timeStr} | 炮弹: ${shell.shellId} | 目标: ${shell.targetName} | 飞行: ${actualFlightTime}秒 | [命中] ${hitShipName}`);
                } else {
                    console.log(`${timeStr} | 炮弹: ${shell.shellId} | 目标: ${shell.targetName} | 飞行: ${actualFlightTime}秒 | [未命中]`);
                }
            }
            
            // 未命中，水花效果
            if (!hitTarget) {
                createSplash(shell.mesh.position);
            }
            
            scene.remove(shell.mesh);
            return false;
        }
        
        // 超时移除
        if (now - shell.startTime > 10) {
            // 己舰炮弹超时日志
            if (shell.isPlayerShell) {
                const nowDate = new Date();
                const timeStr = nowDate.toTimeString().split(' ')[0] + '.' + nowDate.getMilliseconds().toString().padStart(3, '0');
                const actualFlightTime = (Date.now() / 1000 - shell.startTime).toFixed(2);
                console.log(`${timeStr} | 炮弹: ${shell.shellId} | 目标: ${shell.targetName} | 飞行: ${actualFlightTime}秒 | [超时]`);
            }
            scene.remove(shell.mesh);
            return false;
        }
        
        return true;
    });
}

// 更新鱼雷
function updateTorpedoes(deltaTime) {
    const now = Date.now() / 1000;
    
    gameState.torpedoes = gameState.torpedoes.filter(torpedo => {
        // 直线移动
        torpedo.mesh.position.add(torpedo.velocity.clone().multiplyScalar(deltaTime));
        
        // 检查碰撞（不伤害友军）
        let hit = false;
        gameState.allShips.forEach(ship => {
            if (ship === torpedo.ship || ship.sunk) return;
            // 友军不互相伤害（玩家和友军是一边，敌军是另一边）
            const torpedoSide = torpedo.ship.isAlly || torpedo.ship.isPlayer;
            const shipSide = ship.isAlly || ship.isPlayer;
            if (torpedoSide === shipSide) return; // 同一边的不伤害
            
            const distance = torpedo.mesh.position.distanceTo(ship.mesh.position);
            if (distance < 100) {
                // 命中（100米内100%命中）
                const damage = 500;
                ship.hp -= damage;
                createExplosion(ship.mesh.position, 2);
                hit = true;
                
                if (ship.hp <= 0) {
                    sinkShip(ship);
                }
            }
        });
        
        if (hit) {
            scene.remove(torpedo.mesh);
            return false;
        }
        
        // 超时移除
        if (now - torpedo.startTime > GAME_CONFIG.TORPEDO_LIFETIME) {
            scene.remove(torpedo.mesh);
            return false;
        }
        
        return true;
    });
}

// 战舰沉没
function sinkShip(ship) {
    if (ship.sunk) return;
    
    ship.sunk = true;
    ship.sinkTime = Date.now() / 1000;
    
    // 记录击沉信息
    if (ship.isEnemy) {
        gameState.sunkShips.push({
            name: ship.config.name,
            time: new Date().toLocaleTimeString(),
            method: ship.hp <= -500 ? '鱼雷' : '炮击'
        });
    }
    
    // 检查游戏结束
    checkGameEnd();
}

// 更新沉没动画
function updateSinking(deltaTime) {
    const now = Date.now() / 1000;
    
    gameState.allShips.forEach(ship => {
        if (ship.sunk) {
            const sinkProgress = (now - ship.sinkTime) / 3; // 3秒沉没
            
            if (sinkProgress < 1) {
                ship.mesh.position.y = -ship.config.length * 0.3 * sinkProgress;
                ship.mesh.rotation.x = sinkProgress * 0.5;
                ship.mesh.rotation.z = Math.sin(sinkProgress * Math.PI) * 0.3;
            } else {
                ship.mesh.visible = false;
            }
        }
    });
}

// 检测战舰碰撞（返回是否会发生碰撞）
function checkShipCollision(ship, newX, newZ) {
    const shipLength = ship.config.length || 200;
    const shipWidth = ship.config.width || 30;
    // 使用更合理的碰撞半径（长宽平均值的一半）
    const collisionRadius = (shipLength + shipWidth) / 4;
    
    for (let other of gameState.allShips) {
        if (other === ship || other.sunk) continue;
        
        const otherLength = other.config.length || 200;
        const otherWidth = other.config.width || 30;
        const otherRadius = (otherLength + otherWidth) / 4;
        
        const minDistance = collisionRadius + otherRadius;
        
        const dx = newX - other.mesh.position.x;
        const dz = newZ - other.mesh.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);
        
        if (distance < minDistance) {
            return true; // 会发生碰撞
        }
    }
    return false; // 不会碰撞
}

// AI控制
function updateAI(deltaTime) {
    const now = Date.now() / 1000;
    
    gameState.allShips.forEach(ship => {
        if (ship.isPlayer || ship.sunk) return;
        
        // 友舰特殊逻辑：保持与己舰300米以上距离
        if (ship.isAlly && gameState.playerShip && !gameState.playerShip.sunk) {
            const distToPlayer = ship.mesh.position.distanceTo(gameState.playerShip.mesh.position);
            
            if (distToPlayer < 300) {
                // 太近了，远离己舰
                const awayAngle = Math.atan2(
                    ship.mesh.position.x - gameState.playerShip.mesh.position.x,
                    ship.mesh.position.z - gameState.playerShip.mesh.position.z
                );
                
                // 转向远离方向
                let angleDiff = awayAngle - ship.mesh.rotation.y;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                
                ship.turnSpeed = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), ship.config.turnSpeed * 2);
                ship.mesh.rotation.y += ship.turnSpeed * deltaTime;
                
                // 快速远离
                ship.speed = ship.maxSpeed;
                const newX = ship.mesh.position.x + Math.sin(ship.mesh.rotation.y) * ship.speed * deltaTime;
                const newZ = ship.mesh.position.z + Math.cos(ship.mesh.rotation.y) * ship.speed * deltaTime;
                
                if (!checkShipCollision(ship, newX, newZ)) {
                    ship.mesh.position.x = newX;
                    ship.mesh.position.z = newZ;
                }
                
                // 远离时不进行其他AI行为
                return;
            }
        }
        
        // 寻找最近的敌方战舰
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        gameState.allShips.forEach(enemy => {
            if (enemy === ship || enemy.sunk) return;
            // 友军判断：玩家和友军是一边，敌军是另一边
            const shipSide = ship.isPlayer || ship.isAlly;
            const enemySide = enemy.isPlayer || enemy.isAlly;
            if (shipSide === enemySide) return; // 同一边的不攻击
            
            const distance = ship.mesh.position.distanceTo(enemy.mesh.position);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        if (closestEnemy) {
            // 转向目标
            const targetAngle = Math.atan2(
                closestEnemy.mesh.position.x - ship.mesh.position.x,
                closestEnemy.mesh.position.z - ship.mesh.position.z
            );
            
            let angleDiff = targetAngle - ship.mesh.rotation.y;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            ship.turnSpeed = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), ship.config.turnSpeed);
            ship.mesh.rotation.y += ship.turnSpeed * deltaTime;
            
            // 前进（带碰撞检测）
            ship.speed = ship.maxSpeed;
            const newX = ship.mesh.position.x + Math.sin(ship.mesh.rotation.y) * ship.speed * deltaTime;
            const newZ = ship.mesh.position.z + Math.cos(ship.mesh.rotation.y) * ship.speed * deltaTime;
            
            // 检测碰撞
            if (!checkShipCollision(ship, newX, newZ)) {
                ship.mesh.position.x = newX;
                ship.mesh.position.z = newZ;
            } else {
                // 碰撞时停止移动但稍微转向（保持speed不变以生成尾流）
                ship.mesh.rotation.y += ship.config.turnSpeed * deltaTime * 0.5;
            }
            
            // AI开火
            if (now - ship.lastFireTime > GAME_CONFIG.AI_FIRE_INTERVAL && Math.random() < GAME_CONFIG.AI_FIRE_CHANCE) {
                ship.lastFireTime = now;
                fireShells(ship, closestDistance < 3000 ? closestEnemy : null);
            }
            
            // AI发射鱼雷
            if (ship.torpedoCount > 0 && now - ship.lastTorpedoTime > 20 && closestDistance < 2000 && Math.random() < 0.5) {
                ship.lastTorpedoTime = now;
                const salvo = Math.min(ship.config.torpedoSalvo, ship.torpedoCount);
                ship.torpedoCount -= salvo;
                fireTorpedoes(ship, salvo);
            }
        }
    });
}

// 更新玩家战舰
function updatePlayerShip(deltaTime) {
    if (!gameState.playerShip || gameState.playerShip.sunk) return;
    
    const ship = gameState.playerShip;
    
    // 转向
    ship.mesh.rotation.y += ship.turnSpeed * deltaTime;
    
    // 前进（自动向敌方行驶）
    ship.speed = ship.maxSpeed;
    const newX = ship.mesh.position.x + Math.sin(ship.mesh.rotation.y) * ship.speed * deltaTime;
    const newZ = ship.mesh.position.z + Math.cos(ship.mesh.rotation.y) * ship.speed * deltaTime;
    
    // 检查边界
    const distanceFromCenter = Math.sqrt(newX ** 2 + newZ ** 2);
    
    // 检测与其他战舰的碰撞
    const willCollide = checkShipCollision(ship, newX, newZ);
    
    if (distanceFromCenter > GAME_CONFIG.SEA_RADIUS) {
        // 空气墙：阻止移动
        // 不更新位置，战舰卡住
        
        // 空气墙警告
        if (!gameState.boundaryWarning) {
            gameState.boundaryWarning = true;
            gameState.boundaryWarningTime = Date.now();
            document.getElementById('boundaryWarning').classList.add('active');
        }
        
        // 1秒后自动转向战场中心
        if (Date.now() - gameState.boundaryWarningTime > 1000 && ship.turnSpeed === 0) {
            const angleToCenter = Math.atan2(-ship.mesh.position.x, -ship.mesh.position.z);
            let angleDiff = angleToCenter - ship.mesh.rotation.y;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // 自动转向中心
            ship.turnSpeed = Math.sign(angleDiff) * ship.config.turnSpeed * 0.5;
            
            // 0.5秒后停止自动转向
            setTimeout(() => {
                if (ship.turnSpeed !== 0 && Math.abs(angleDiff) < 0.1) {
                    ship.turnSpeed = 0;
                }
            }, 500);
        }
    } else if (willCollide) {
        // 与其他战舰碰撞：阻止移动（保持speed不变以生成尾流）
    } else {
        // 正常移动
        ship.mesh.position.x = newX;
        ship.mesh.position.z = newZ;
        
        if (gameState.boundaryWarning) {
            gameState.boundaryWarning = false;
            document.getElementById('boundaryWarning').classList.remove('active');
        }
    }
}

// 更新爆炸效果
function updateExplosions(deltaTime) {
    const now = Date.now() / 1000;
    
    gameState.explosions = gameState.explosions.filter(exp => {
        const progress = (now - exp.startTime) / exp.duration;
        
        if (progress >= 1) {
            scene.remove(exp.mesh);
            return false;
        }
        
        exp.mesh.scale.setScalar(1 + progress * 2);
        exp.mesh.material.opacity = 0.8 * (1 - progress);
        
        return true;
    });
}

// 更新水花效果
function updateSplashes(deltaTime) {
    const now = Date.now() / 1000;
    
    gameState.splashes = gameState.splashes.filter(splash => {
        const progress = (now - splash.startTime) / splash.duration;
        
        if (progress >= 1) {
            scene.remove(splash.mesh);
            return false;
        }
        
        splash.mesh.scale.setScalar(1 + progress);
        splash.mesh.material.opacity = 0.6 * (1 - progress);
        
        return true;
    });
}

// 更新UI
function updateUI() {
    if (!gameState.playerShip) return;
    
    // 寻找准星中的目标
    findTargetInCrosshair();
    
    // 更新战舰列表
    updateShipList();
}

// 更新战舰列表
function updateShipList() {
    const allyList = document.getElementById('allyList');
    const enemyList = document.getElementById('enemyList');
    
    // 清空列表
    allyList.innerHTML = '';
    enemyList.innerHTML = '';
    
    // 更新我方舰队列表
    let allyCount = 0;
    gameState.allShips.forEach(ship => {
        if (ship.isEnemy || ship.sunk) return;
        
        allyCount++;
        const shipItem = createShipListItem(ship);
        allyList.appendChild(shipItem);
    });
    
    // 更新敌方舰队列表
    let enemyCount = 0;
    gameState.allShips.forEach(ship => {
        if (!ship.isEnemy || ship.sunk) return;
        
        enemyCount++;
        const shipItem = createShipListItem(ship);
        enemyList.appendChild(shipItem);
    });
    
    // 更新标题显示剩余数量
    const allyTitle = allyList.previousElementSibling;
    const enemyTitle = enemyList.previousElementSibling;
    if (allyTitle) allyTitle.textContent = `我方舰队 (${allyCount}艘)`;
    if (enemyTitle) enemyTitle.textContent = `敌方舰队 (${enemyCount}艘)`;
}

// 创建战舰列表项
function createShipListItem(ship) {
    const item = document.createElement('div');
    item.className = 'ship-item';
    item.id = `ship-item-${ship.config.name}`;
    
    const nameDiv = document.createElement('div');
    nameDiv.className = 'ship-item-name';
    nameDiv.textContent = ship.config.name;
    
    const hpBar = document.createElement('div');
    hpBar.className = 'ship-item-hp-bar';
    
    const hpFill = document.createElement('div');
    hpFill.className = 'ship-item-hp-fill';
    const hpPercent = Math.max(0, (ship.hp / ship.config.maxHp) * 100);
    hpFill.style.width = hpPercent + '%';
    
    // 根据血量设置颜色
    if (hpPercent > 50) {
        hpFill.classList.add('high');
    } else if (hpPercent > 20) {
        hpFill.classList.add('medium');
    } else {
        hpFill.classList.add('low');
    }
    
    hpBar.appendChild(hpFill);
    
    const hpText = document.createElement('div');
    hpText.className = 'ship-item-hp-text';
    hpText.textContent = `${Math.max(0, Math.round(ship.hp))}/${ship.config.maxHp}`;
    
    item.appendChild(nameDiv);
    item.appendChild(hpBar);
    item.appendChild(hpText);
    
    return item;
}

// 更新鱼雷显示
function updateTorpedoDisplay() {
    if (!gameState.playerShip) return;
    document.getElementById('torpedoCount').textContent = gameState.playerShip.torpedoCount;
}

// 检查游戏结束
function checkGameEnd() {
    // 己舰沉没直接失败
    if (gameState.playerShip && gameState.playerShip.sunk) {
        endGame(false);
        return;
    }
    
    const enemiesAlive = gameState.enemyShips.filter(s => !s.sunk).length;
    
    // 敌方全灭则胜利
    if (enemiesAlive === 0) {
        endGame(true);
    }
}

// 结束游戏
function endGame(victory) {
    gameState.running = false;
    gameState.endTime = Date.now();
    
    // 停止背景音乐
    stopBGM();
    
    const duration = Math.round((gameState.endTime - gameState.startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    // 计算积分
    let score = 0;
    gameState.sunkShips.forEach(s => {
        score += s.name === '俾斯麦' ? 1000 : 200;
    });
    
    gameState.allShips.forEach(s => {
        if (!s.sunk) {
            score += Math.round(s.hp / 10);
        }
    });
    
    // 显示结算界面
    document.getElementById('resultScreen').style.display = 'flex';
    document.getElementById('resultTitle').textContent = victory ? '胜利!' : '失败!';
    document.getElementById('resultTitle').style.color = victory ? '#00ff00' : '#ff0000';
    document.getElementById('resultScore').textContent = `积分: ${score}`;
    document.getElementById('resultTime').textContent = `交战时长: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // 击沉列表
    const listEl = document.getElementById('resultList');
    listEl.innerHTML = '';
    if (gameState.sunkShips.length === 0) {
        listEl.innerHTML = '<div class="result-item">未击沉任何敌舰</div>';
    } else {
        gameState.sunkShips.forEach(s => {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.textContent = `${s.time} - 击沉 ${s.name} (${s.method})`;
            listEl.appendChild(item);
        });
    }
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // 更新准星位置
    if (gameState.crosshair) {
        updateCrosshairPosition();
    }
}

// 开始游戏
function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('resultScreen').style.display = 'none';
    
    // 初始化并播放音频
    initAudio();
    playBGM();
    
    gameState.running = true;
    gameState.startTime = Date.now();
    gameState.sunkShips = [];
    gameState.shells = [];
    gameState.torpedoes = [];
    gameState.explosions = [];
    gameState.splashes = [];
    
    // 清理尾流
    wakes.forEach(wake => scene.remove(wake.mesh));
    wakes = [];
    
    initBattle().then(() => {
        updateTorpedoDisplay();
    });
}

// 重新开始
function restartGame() {
    startGame();
}

// 动画循环
let lastWakeTime = 0; // 上次生成尾流的时间

function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    // 云朵始终飘动（不管游戏是否运行）
    updateClouds(deltaTime);
    
    if (gameState.running) {
        // 更新相机平滑
        gameState.camera.rotationX += (gameState.camera.targetRotationX - gameState.camera.rotationX) * 0.1;
        gameState.camera.rotationY += (gameState.camera.targetRotationY - gameState.camera.rotationY) * 0.1;
        
        // 更新海面波浪动画
        if (water && water.geometry.userData.originalPositions) {
            const positions = water.geometry.attributes.position.array;
            const original = water.geometry.userData.originalPositions;
            const time = Date.now() * 0.001;
            
            for (let i = 0; i < positions.length; i += 3) {
                const x = original[i];
                const y = original[i + 1];
                // 多层波浪叠加
                const wave1 = Math.sin(x * 0.01 + time) * 3;
                const wave2 = Math.sin(y * 0.015 + time * 1.3) * 2;
                const wave3 = Math.sin((x + y) * 0.008 + time * 0.7) * 2;
                positions[i + 2] = wave1 + wave2 + wave3;
            }
            water.geometry.attributes.position.needsUpdate = true;
            water.geometry.computeVertexNormals();
        }
        
        // 更新游戏逻辑
        updatePlayerShip(deltaTime);
        updateAI(deltaTime);
        
        // 定期为所有战舰生成尾流（放在战舰更新后）
        const now = Date.now();
        if (now - lastWakeTime > 200) { // 每200ms生成一次尾流
            lastWakeTime = now;
            gameState.allShips.forEach(ship => {
                if (!ship.sunk && ship.speed > 0) {
                    createWake(ship);
                }
            });
        }
        
        updateShells(deltaTime);
        updateTorpedoes(deltaTime);
        updateSinking(deltaTime);
        updateExplosions(deltaTime);
        updateSplashes(deltaTime);
        updateWakes(deltaTime); // 更新尾流
        updateCamera();
        updateUI();
    }
    
    renderer.render(scene, camera);
}

// 初始化
init();
