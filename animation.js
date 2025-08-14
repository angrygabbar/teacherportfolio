document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('3d-canvas');
    if (!canvas) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create a group for the objects
    const group = new THREE.Group();
    scene.add(group);

    // Geometries and Materials
    const geometries = [
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.TorusGeometry(0.4, 0.15, 16, 100)
    ];
    const materials = [
        new THREE.MeshStandardMaterial({ color: 0x818cf8, roughness: 0.4, metalness: 0.2 }),
        new THREE.MeshStandardMaterial({ color: 0xc7d2fe, roughness: 0.6, metalness: 0.1 }),
        new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.5, metalness: 0.3 })
    ];

    // Create and position objects
    for (let i = 0; i < 50; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = materials[Math.floor(Math.random() * materials.length)];
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.x = (Math.random() - 0.5) * 10;
        mesh.position.y = (Math.random() - 0.5) * 10;
        mesh.position.z = (Math.random() - 0.5) * 10;

        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        const scale = Math.random() * 0.5 + 0.25;
        mesh.scale.set(scale, scale, scale);

        group.add(mesh);
    }

    camera.position.z = 5;

    // Mouse movement interaction
    const mouse = new THREE.Vector2();
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
        const elapsedTime = clock.getElapsedTime();

        // Animate objects
        group.rotation.y = elapsedTime * 0.1;

        // Animate camera based on mouse
        camera.position.x += (mouse.x * 2 - camera.position.x) * 0.05;
        camera.position.y += (mouse.y * 2 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
});
