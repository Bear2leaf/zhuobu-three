import Ammo, { config, Module, handler, MainMessage, WorkerMessage, PhyicsObject } from "./ammo.worker.js"

enum CollisionFlags {
    CF_STATIC_OBJECT = 1,
    CF_KINEMATIC_OBJECT = 2,
    CF_NO_CONTACT_RESPONSE = 4,
    CF_CUSTOM_MATERIAL_CALLBACK = 8,//this allows per-triangle material (friction/restitution)
    CF_CHARACTER_OBJECT = 16,
    CF_DISABLE_VISUALIZE_OBJECT = 32, //disable debug drawing
    CF_DISABLE_SPU_COLLISION_PROCESSING = 64//disable parallel/SPU processing
};
const initQueue: MainMessage[] = []
handler.onmessage = function (message) {
    initQueue.push(message);
}



Ammo.bind(Module)(config).then(function (Ammo) {
    handler.postMessage({ type: "ready" });
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    const dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));

    const result: WorkerMessage & { type: "update" } = { type: "update", data: [] };
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
        const sphereShape = new Ammo.btCapsuleShape(0.8 * 0.25, 1.5 * 0.25);
        sphereShape.calculateLocalInertia(mass, localInertia);

        const myMotionState = new Ammo.btDefaultMotionState(startTransform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, sphereShape, localInertia);
        const body = new Ammo.btRigidBody(rbInfo);
        body.setFriction(1)
        body.setRestitution(0);
        body.setAngularFactor(new Ammo.btVector3(0, 0, 0));
        const v = new UserData;
        v.propertities = {
            ball: true
        };
        v.name = "Ball"
        body.setUserPointer(v);
        body.setCollisionFlags(CollisionFlags.CF_CHARACTER_OBJECT)
        dynamicsWorld.addRigidBody(body);
        bodies.push(body);
    };
    function readBulletObject(body: Ammo.btRigidBody) {
        body.getMotionState().getWorldTransform(transform);
        const origin = transform.getOrigin();
        const object: [number, number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0, 0];
        object[0] = (origin.x());
        object[1] = (origin.y());
        object[2] = (origin.z());
        const rotation = transform.getRotation();
        object[3] = (rotation.x());
        object[4] = (rotation.y());
        object[5] = (rotation.z());
        object[6] = (rotation.w());
        return object;
    }
    function writeBulletObject(object: PhyicsObject) {
        const body = bodies.find(body => Ammo.castObject(body.getUserPointer(), UserData).name === object[7]);
        if (body === undefined) {
            return;
        }
        const motionState = body.getMotionState();
        motionState.getWorldTransform(transform);
        const origin = transform.getOrigin();
        origin.setX(object[0]);
        origin.setY(object[1]);
        origin.setZ(object[2]);
        transform.setOrigin(origin);
        const rotation = transform.getRotation();
        rotation.setX(object[3]);
        rotation.setY(object[4]);
        rotation.setZ(object[5]);
        rotation.setW(object[6]);
        transform.setRotation(rotation);
        motionState.setWorldTransform(transform);
        body.setMotionState(motionState);
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
            const state = body.getMotionState();
            state.getWorldTransform(startTransform);
            startTransform.setFromOpenGLMatrix(message.data.transform);
            state.setWorldTransform(startTransform);
            body.setMotionState(state);
            body.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
            body.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
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
            if (convex) {
                shape = new Ammo.btConvexHullShape();
                for (let i = 0; i < newVertices.length / 3; i++) {
                    vertex0.setValue(newVertices[i * 3 + 0], newVertices[i * 3 + 1], newVertices[i * 3 + 2]);
                    shape.addPoint(vertex0);
                }
            } else {
                const mesh = new Ammo.btTriangleMesh();

                for (let i = 0; i < newVertices.length / 9; i++) {
                    vertex0.setValue(newVertices[i * 9 + 0], newVertices[i * 9 + 1], newVertices[i * 9 + 2]);
                    vertex1.setValue(newVertices[i * 9 + 3], newVertices[i * 9 + 4], newVertices[i * 9 + 5]);
                    vertex2.setValue(newVertices[i * 9 + 6], newVertices[i * 9 + 7], newVertices[i * 9 + 8]);
                    mesh.addTriangle(vertex0, vertex1, vertex2)
                }
                shape = new Ammo.btBvhTriangleMeshShape(mesh, true, true);
            }
            shape.setMargin(0.05);
            shape.setLocalScaling(scale);
            shape.calculateLocalInertia(mass, localInertia);

            const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia);
            const body = new Ammo.btRigidBody(rbInfo);
            body.setFriction(1)
            body.setCollisionFlags(CollisionFlags.CF_KINEMATIC_OBJECT)
            body.setUserPointer(v);
            body.setRestitution(0);
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
        } else if (message.type === "tick") {
            for (let i = 0; i < message.data.objects.length; i++) {
                writeBulletObject(message.data.objects[i]);
            }
            simulate(message.data.delta);
        }
    }
    function updateVelocity({ name, x, y, z }: (MainMessage & { type: "updateVelocity" })["data"]) {
        const body = bodies.find(body => Ammo.castObject(body.getUserPointer(), UserData).name === name);
        if (body === undefined) {
            return
        }
        tempVec.setValue(x, y, z);
        body.setLinearVelocity(tempVec);
        body.activate();

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
            if (data0.name === "Ball") {
                for (let index = 0; index < mainfold.getNumContacts(); index++) {
                    const element = mainfold.getContactPoint(index);
                    const normal = element.get_m_normalWorldOnB();
                    if (Math.round(normal.y())) {
                        body1.setFriction(1);
                    } else {
                        body1.setFriction(0);
                    }

                }
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
            return;
        }
        dynamicsWorld.stepSimulation(dt);
        {

            for (const body of bodies) {
                const props = Ammo.castObject(body.getUserPointer(), UserData).propertities;
                if (props && props.dynamic) {
                    const state = body.getMotionState();
                    transform.setOrigin(tempVec)
                    state.setWorldTransform(transform)
                    body.setMotionState(state);
                }
            }
        }

        result.data = [];
        // Read bullet data into JS objects
        for (let i = 0; i < bodies.length; i++) {
            const data = Ammo.castObject(bodies[i].getUserPointer(), UserData);
            if (data.name) {
                if (data.name === "Ball") {
                    const object = readBulletObject(bodies[i]);
                    const velocity: [number, number, number] = [0, 0, 0];
                    const linearVelocity = bodies[i].getLinearVelocity();
                    velocity[0] = linearVelocity.x();
                    velocity[1] = linearVelocity.y();
                    velocity[2] = linearVelocity.z();
                    handler.postMessage({
                        type: "updateCharacter",
                        data: [...object, ...velocity]
                    });
                } else {
                    const object = readBulletObject(bodies[i]);
                    result.data.push([...object, data.name]);
                }
            }

        }
        handler.postMessage(result);
        prepareCollision();
        handleCollision();
    }

});
