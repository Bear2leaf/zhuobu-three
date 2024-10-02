import Ammo, { config, Module, handler, MainMessage, WorkerMessage } from "./ammo.worker.js"


enum CollisionFlags {
    CF_STATIC_OBJECT = 1,
    CF_KINEMATIC_OBJECT = 2,
    CF_NO_CONTACT_RESPONSE = 4,
    CF_CUSTOM_MATERIAL_CALLBACK = 8,//this allows per-triangle material (friction/restitution)
    CF_CHARACTER_OBJECT = 16,
    CF_DISABLE_VISUALIZE_OBJECT = 32, //disable debug drawing
    CF_DISABLE_SPU_COLLISION_PROCESSING = 64//disable parallel/SPU processing
};
const DISABLE_DEACTIVATION = 4;
const initQueue: MainMessage[] = []
handler.onmessage = function (message) {
    initQueue.push(message);
}

Ammo.bind(Module)(config).then(function (Ammo) {
    // Bullet-interfacing code

    handler.postMessage({ type: "ready" });
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    const dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

    const tempVec = new Ammo.btVector3;
    const collisionSetPrev = new Set<string>();
    const collisionSet = new Set<string>();
    let pause = true;
    const bodies: Ammo.btRigidBody[] = [];
    const transform = new Ammo.btTransform(); // taking this out of readBulletObject reduces the leaking

    class UserData extends Ammo.btVector3 {
        propertities?: Record<string, boolean>
        name?: string
    }
    const gravity = new Ammo.btVector3(0, 0, 0);
    let interval: number | null = null;
    const vertex0 = new Ammo.btVector3;
    const vertex1 = new Ammo.btVector3;
    const vertex2 = new Ammo.btVector3;
    createBall();
    for (const message of initQueue) {
        messageHandler(message);
    }
    handler.onmessage = function (message) {
        messageHandler(message);
    }
    function createBall() {
        const startTransform = new Ammo.btTransform();
        startTransform.setIdentity();
        const mass = 10;
        const localInertia = new Ammo.btVector3(0, 0, 0);
        const sphereShape = new Ammo.btCapsuleShape(0.08, 0.15);
        sphereShape.calculateLocalInertia(mass, localInertia);

        const myMotionState = new Ammo.btDefaultMotionState(startTransform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, sphereShape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);
        body.setAngularFactor(new Ammo.btVector3());
        const v = new UserData;
        v.propertities = {
            ball: true
        };
        v.name = "Ball"
        body.setUserPointer(v)
        dynamicsWorld.addRigidBody(body);
        bodies.push(body);
        body.setActivationState(DISABLE_DEACTIVATION)
    };
    function readBulletObject(i: number, object: [number, number, number, number, number, number, number, string, number, number, number]) {
        const body = bodies[i];
        body.getMotionState().getWorldTransform(transform);
        const origin = transform.getOrigin();
        object[0] = origin.x();
        object[1] = origin.y();
        object[2] = origin.z();
        const rotation = transform.getRotation();
        object[3] = rotation.x();
        object[4] = rotation.y();
        object[5] = rotation.z();
        object[6] = rotation.w();
        const data = Ammo.castObject(body.getUserPointer(), UserData);
        object[7] = data.name!;
        const velocity = body.getLinearVelocity();
        object[8] = velocity.x();
        object[9] = velocity.y();
        object[10] = velocity.z();
    }
    function messageHandler(message: MainMessage) {
        if (message.type === "updateGravity") {
            const g = message.data.split(",").map(x => parseFloat(x));
            gravity.setX(g[0])
            gravity.setY(g[1])
            gravity.setZ(g[2])
            dynamicsWorld.setGravity(gravity);
            return;
        } else if (message.type === "addBall") {
            const body = bodies.find(body => Ammo.castObject(body.getUserPointer(), UserData).name === "Ball");
            if (body === undefined) {
                throw new Error("ball body is undefined")
            }
            const startTransform = new Ammo.btTransform();
            startTransform.setFromOpenGLMatrix(message.data.transform);
            const state = new Ammo.btDefaultMotionState(startTransform);
            state.setWorldTransform(startTransform);
            body.setMotionState(state);
        } else if (message.type === "addMesh") {
            const startTransform = new Ammo.btTransform();
            startTransform.setIdentity();
            const mass = 0;
            const localInertia = new Ammo.btVector3(0, 0, 0);
            const transform = message.data.transform;
            const vertices = message.data.vertices;
            const indices = message.data.indices;
            const convex = message.data.convex;
            const newVertices: number[] = [];
            if (indices.length) {

                for (let index = 0; index < indices.length; index++) {
                    const i = indices[index];
                    newVertices.push(vertices[i * 3 + 0], vertices[i * 3 + 1], vertices[i * 3 + 2])
                }
            } else {
                newVertices.push(...vertices);
            }
            const scaleX = transform[7];
            const scaleY = transform[8];
            const scaleZ = transform[9];
            const scale = new Ammo.btVector3(scaleX, scaleY, scaleZ);
            startTransform.setOrigin(new Ammo.btVector3(transform[0], transform[1], transform[2]))
            startTransform.setRotation(new Ammo.btQuaternion(transform[3], transform[4], transform[5], transform[6]))
            let shape
            const myMotionState = new Ammo.btDefaultMotionState(startTransform);

            const v = new UserData;
            v.propertities = message.data.propertities;
            v.name = message.data.name;
            if (v.propertities?.dynamic || convex) {
                shape = new Ammo.btConvexHullShape();
                for (let i = 0; i < newVertices.length / 3; i++) {
                    vertex0.setValue(newVertices[i * 3 + 0], newVertices[i * 3 + 1], newVertices[i * 3 + 2]);
                    shape.addPoint(vertex0);
                }
            } else {
                const mesh = new Ammo.btTriangleMesh();

                mesh.setScaling(scale)
                for (let i = 0; i < newVertices.length / 9; i++) {
                    vertex0.setValue(newVertices[i * 9 + 0], newVertices[i * 9 + 1], newVertices[i * 9 + 2]);
                    vertex1.setValue(newVertices[i * 9 + 3], newVertices[i * 9 + 4], newVertices[i * 9 + 5]);
                    vertex2.setValue(newVertices[i * 9 + 6], newVertices[i * 9 + 7], newVertices[i * 9 + 8]);
                    mesh.addTriangle(vertex0, vertex1, vertex2)
                }
                shape = new Ammo.btBvhTriangleMeshShape(mesh, true);
            }
            shape.calculateLocalInertia(mass, localInertia);
            const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
            const body = new Ammo.btRigidBody(rbInfo);
            if (v.propertities?.dynamic) {
                body.setCollisionFlags(body.getCollisionFlags() | CollisionFlags.CF_KINEMATIC_OBJECT)
            }
            body.setUserPointer(v)
            dynamicsWorld.addRigidBody(body);
            bodies.push(body);
        } else if (message.type === "resetWorld") {
            handler.postMessage({
                type: "requestLevel",
            })
            pause = true;
        } else if (message.type === "release") {
            pause = false;
        } else if (message.type === "pause") {
            pause = true;
        } else if (message.type === "updateVelocity") {
            updateVelocity(message.data)
        } else if (message.type === "teleport") {
            const [from, to] = message.data;
            const bodyFrom = bodies.find(body => Ammo.castObject(body.getUserPointer(), UserData).name === from)
            const bodyTo = bodies.find(body => Ammo.castObject(body.getUserPointer(), UserData).name === to)
            if (bodyFrom && bodyTo) {
                bodyTo.setCollisionFlags(CollisionFlags.CF_NO_CONTACT_RESPONSE);

                const transform = new Ammo.btTransform;
                bodyTo.getMotionState().getWorldTransform(transform);
                const state = bodyFrom.getMotionState();
                state.setWorldTransform(transform);
                bodyFrom.setMotionState(state);
            }
        } else if (message.type === "removeMesh") {
            const body = bodies.find(body => Ammo.castObject(body.getUserPointer(), UserData).name === message.data)
            if (body) {
                bodies.splice(bodies.indexOf(body), 1);
                dynamicsWorld.removeRigidBody(body);
            }
        } else if (message.type === "enableMesh") {
            updateBodyCollision(message.data, true);
        } else if (message.type === "disableMesh") {
            updateBodyCollision(message.data, false);
        }
    }
    function updateVelocity({ name, x, y, z }: (MainMessage & { type: "updateVelocity" })["data"]) {
        const body = bodies.find(body => Ammo.castObject(body.getUserPointer(), UserData).name === name);
        if (body === undefined) {
            return
        }
        tempVec.setValue(x, y, z);
        body.setLinearVelocity(tempVec);

    }
    function prepareCollision() {
        collisionSetPrev.clear();
        for (const element of collisionSet) {
            collisionSetPrev.add(element);
        }
        collisionSet.clear();
        const collisionNum = dispatcher.getNumManifolds();
        for (let index = 0; index < collisionNum; index++) {
            // UserData
            const mainfold = dispatcher.getManifoldByIndexInternal(index);
            const body0 = mainfold.getBody0();
            const body1 = mainfold.getBody1();
            const data0 = Ammo.castObject(body0.getUserPointer(), UserData);
            const data1 = Ammo.castObject(body1.getUserPointer(), UserData);
            if (!collisionSet.has(`${data0.name}###${data1.name}`)) {
                collisionSet.add(`${data0.name}###${data1.name}`);
            }
        }
    }
    function handleCollision() {
        const combinedSet = new Set([...collisionSet, ...collisionSetPrev]);
        for (const element of combinedSet) {
            const [data0, data1] = element.split("###");
            const prev = collisionSetPrev.has(element);
            const curr = collisionSet.has(element);
            if (!prev) {
                handler.postMessage({
                    type: "collisionEnter",
                    data: [data0, data1]
                });
            } else if (curr) {
                handler.postMessage({
                    type: "collisionUpdate",
                    data: [data0, data1]
                });
            } else {
                handler.postMessage({
                    type: "collisionExit",
                    data: [data0, data1]
                });
            }
        }
    }
    let meanDt = 0, meanDt2 = 0, frame = 1;
    const result: WorkerMessage & { type: "update" } = { type: "update", objects: [] };
    function updateBodyCollision(name: string, enable: boolean) {
        const body = bodies.find(body => Ammo.castObject(body.getUserPointer(), UserData).name === name);
        if (body === undefined) {
            return
        }
        if (enable) {
            body.setCollisionFlags(CollisionFlags.CF_STATIC_OBJECT);
        } else {
            body.setCollisionFlags(CollisionFlags.CF_NO_CONTACT_RESPONSE);
        }
    }
    function simulate(dt: number) {
        if (pause) {

            // Read bullet data into JS objects
            for (let i = 0; i < bodies.length; i++) {
                result.objects[i] = result.objects[i] || []
                readBulletObject(i, result.objects[i]);

            }
            handler.postMessage(result);
            return;
        }
        dt = dt || 1;
        dynamicsWorld.stepSimulation(dt, 2);


        {

            for (const body of bodies) {
                const props = Ammo.castObject(body.getUserPointer(), UserData).propertities;
                if (props && props.dynamic) {
                    const state = body.getMotionState();
                    tempVec.setValue(5 * Math.sin(frame / 100), -5, 0)
                    transform.setOrigin(tempVec)
                    state.setWorldTransform(transform)
                    body.setMotionState(state);
                }
            }
        }

        let alpha;
        if (meanDt > 0) {
            alpha = Math.min(0.1, dt / 1000);
        } else {
            alpha = 0.1; // first run
        }
        meanDt = alpha * dt + (1 - alpha) * meanDt;

        const alpha2 = 1 / frame++;
        meanDt2 = alpha2 * dt + (1 - alpha2) * meanDt2;




        // Read bullet data into JS objects
        for (let i = 0; i < bodies.length; i++) {
            result.objects[i] = result.objects[i] || []
            readBulletObject(i, result.objects[i]);

        }
        handler.postMessage(result);
        prepareCollision();
        handleCollision();
    }
    frame = 1;
    meanDt = meanDt2 = 0;


    let last = Date.now();
    function mainLoop() {
        const now = Date.now();
        // dynamicsWorld.setGravity(new Ammo.btVector3(Math.sin(now) * 10, Math.cos(now) * 10 ,0))
        simulate(now - last);
        last = now;
    }

    if (interval) clearInterval(interval);
    interval = setInterval(mainLoop, 1000 / 60);
});
