require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d2h2whv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create Client with increased timeout settings
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 45000,  // 45 seconds
});

// Connect immediately and reuse promise
const clientPromise = client.connect();

// Helper to get collections safely
async function getCollection(collectionName) {
    try {
        await clientPromise; // Wait for DB connection
        return client.db('PlantsDB').collection(collectionName);
    } catch (error) {
        console.error("Database Connection Failed in Helper:", error);
        throw new Error("Failed to connect to database");
    }
}

// ------------------- ROUTES -------------------

// Create plant
app.post('/plants', async (req, res) => {
    try {
        const PlantsCollection = await getCollection('plants');
        const getPlants = req.body;
        const result = await PlantsCollection.insertOne(getPlants);
        res.send(result);
    } catch (error) {
        console.error("Error creating plant:", error);
        res.status(500).send({ message: "Error creating plant" });
    }
});

// Get all plants
app.get('/plants', async (req, res) => {
    try {
        const PlantsCollection = await getCollection('plants');
        const result = await PlantsCollection.find().toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching plants:", error);
        res.status(500).send({ message: "Error fetching plants" });
    }
});

// GET my plants by email
app.get("/plants/my", async (req, res) => {
    try {
        const PlantsCollection = await getCollection('plants');
        const email = req.query.email;
        const result = await PlantsCollection.find({ email }).toArray();
        res.send(result);
    } catch (error) {
        console.error("Error fetching user plants:", error);
        res.status(500).send({ message: "Error fetching user plants" });
    }
});

// Get single plant
app.get('/plants/:id', async (req, res) => {
    try {
        const PlantsCollection = await getCollection('plants');
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await PlantsCollection.findOne(query);
        res.send(result);
    } catch (error) {
        console.error("Error fetching plant:", error);
        res.status(500).send({ message: "Error fetching plant" });
    }
});

// Update plant
app.put('/plants/:id', async (req, res) => {
    try {
        const PlantsCollection = await getCollection('plants');
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedPlant = req.body;
        const updatedDocument = {
            $set: updatedPlant
        };
        const result = await PlantsCollection.updateOne(filter, updatedDocument, options);
        res.send(result);
    } catch (error) {
        console.error("Error updating plant:", error);
        res.status(500).send({ message: "Error updating plant" });
    }
});

// Delete plant
app.delete('/plants/:id', async (req, res) => {
    try {
        const PlantsCollection = await getCollection('plants');
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await PlantsCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        console.error("Error deleting plant:", error);
        res.status(500).send({ message: "Error deleting plant" });
    }
});


// ------------------- CATEGORY ROUTES -------------------

app.post('/api/v1/category', async (req, res) => {
    try {
        const CategoriesCollection = await getCollection('categories');
        const { categoryName } = req.body;

        if (!categoryName) {
            return res.status(400).send({ success: false, message: 'categoryName is required' });
        }

        const now = new Date().toISOString();
        const doc = { categoryName, createdAt: now, updatedAt: now };
        const result = await CategoriesCollection.insertOne(doc);

        res.send({ success: true, message: 'Category created successfully!', data: { id: result.insertedId.toString(), ...doc } });
    } catch (error) {
        console.error('POST /api/v1/category error', error);
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});

app.get('/api/v1/category', async (req, res) => {
    try {
        const CategoriesCollection = await getCollection('categories');
        const docs = await CategoriesCollection.find().toArray();
        const data = docs.map((c) => ({ id: c._id.toString(), categoryName: c.categoryName, createdAt: c.createdAt, updatedAt: c.updatedAt }));
        res.send({ success: true, message: 'Categories fetched successfully!', data });
    } catch (error) {
        console.error('GET /api/v1/category error', error);
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});

app.get('/api/v1/category/:id', async (req, res) => {
    try {
        const CategoriesCollection = await getCollection('categories');
        const id = req.params.id;
        const doc = await CategoriesCollection.findOne({ _id: new ObjectId(id) });
        if (!doc) return res.status(404).send({ success: false, message: 'Category not found' });
        res.send({ success: true, message: 'Category fetched successfully!', data: { id: doc._id.toString(), ...doc } });
    } catch (error) {
        console.error('GET /api/v1/category/:id error', error);
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});

app.put('/api/v1/category/:id', async (req, res) => {
    try {
        const CategoriesCollection = await getCollection('categories');
        const id = req.params.id;
        const { categoryName } = req.body;
        const update = { $set: { ...(categoryName ? { categoryName } : {}), updatedAt: new Date().toISOString() } };
        const result = await CategoriesCollection.findOneAndUpdate({ _id: new ObjectId(id) }, update, { returnDocument: 'after' });
        
        if (!result.value) return res.status(404).send({ success: false, message: 'Category not found' });
        res.send({ success: true, message: 'Category updated successfully!', data: result.value });
    } catch (error) {
        console.error('PUT /api/v1/category/:id error', error);
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});

app.delete('/api/v1/category/:id', async (req, res) => {
    try {
        const CategoriesCollection = await getCollection('categories');
        const id = req.params.id;
        const result = await CategoriesCollection.deleteOne({ _id: new ObjectId(id) });
        
        if (!result.deletedCount) return res.status(404).send({ success: false, message: 'Category not found' });
        res.send({ success: true, message: 'Category deleted successfully!', data: null });
    } catch (error) {
        console.error('DELETE /api/v1/category/:id error', error);
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});


// ------------------- PRODUCT ROUTES -------------------

app.post('/api/v1/products', async (req, res) => {
    try {
        const ProductsCollection = await getCollection('products');
        const { productName, description, price, stock, images, categoryId } = req.body;

        if (!productName || !description || price == null || stock == null || !categoryId) {
            return res.status(400).send({ success: false, message: 'Missing required fields' });
        }

        const now = new Date().toISOString();
        const doc = { productName, description, price: Number(price), stock: Number(stock), images: Array.isArray(images) ? images : [], categoryId, isDeleted: false, createdAt: now, updatedAt: now };
        const result = await ProductsCollection.insertOne(doc);

        res.send({ success: true, message: 'Product Registered successfully!', data: { id: result.insertedId.toString(), ...doc } });
    } catch (error) {
        console.error('POST /api/v1/products error', error);
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});

app.get('/api/v1/products', async (req, res) => {
    try {
        const ProductsCollection = await getCollection('products');
        const docs = await ProductsCollection.find({ isDeleted: { $ne: true } }).toArray();
        const data = docs.map((p) => ({ id: p._id.toString(), productName: p.productName, description: p.description, price: p.price, stock: p.stock, images: p.images, categoryId: p.categoryId, isDeleted: !!p.isDeleted, createdAt: p.createdAt, updatedAt: p.updatedAt }));
        
        res.send({ success: true, message: 'Products fetched successfully!', data });
    } catch (error) {
        console.error('GET /api/v1/products error', error);
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});

app.get('/api/v1/products/:id', async (req, res) => {
    try {
        const ProductsCollection = await getCollection('products');
        const id = req.params.id;
        const doc = await ProductsCollection.findOne({ _id: new ObjectId(id), isDeleted: { $ne: true } });
        
        if (!doc) return res.status(404).send({ success: false, message: 'Product not found' });
        res.send({ success: true, message: 'Product fetched successfully!', data: { id: doc._id.toString(), ...doc } });
    } catch (error) {
        console.error('GET /api/v1/products/:id error', error);
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});

app.put('/api/v1/products/:id', async (req, res) => {
    try {
        const ProductsCollection = await getCollection('products');
        const id = req.params.id;
        const body = req.body;
        const updateFields = {
            ...(body.productName != null && { productName: body.productName }),
            ...(body.description != null && { description: body.description }),
            ...(body.price != null && { price: Number(body.price) }),
            ...(body.stock != null && { stock: Number(body.stock) }),
            ...(body.images != null && { images: body.images }),
            ...(body.categoryId != null && { categoryId: body.categoryId }),
            ...(body.isDeleted != null && { isDeleted: !!body.isDeleted }),
            updatedAt: new Date().toISOString(),
        };

        const result = await ProductsCollection.findOneAndUpdate(
            { _id: new ObjectId(id) }, 
            { $set: updateFields }, 
            { returnDocument: 'after' }
        );

        if (!result.value) return res.status(404).send({ success: false, message: 'Product not found' });
        res.send({ success: true, message: 'Product updated successfully!', data: result.value });
    } catch (error) {
        console.error('PUT /api/v1/products/:id error', error);
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});

app.delete('/api/v1/products/:id', async (req, res) => {
    try {
        const ProductsCollection = await getCollection('products');
        const id = req.params.id;
        const result = await ProductsCollection.updateOne(
            { _id: new ObjectId(id) }, 
            { $set: { isDeleted: true, updatedAt: new Date().toISOString() } }
        );

        if (!result.matchedCount) return res.status(404).send({ success: false, message: 'Product not found' });
        res.send({ success: true, message: 'Product deleted successfully!', data: null });
    } catch (error) {
        console.error('DELETE /api/v1/products/:id error', error);
        res.status(500).send({ success: false, message: 'Internal server error', error: error.message });
    }
});


// ------------------- BASE ROUTE -------------------
app.get('/', (req, res) => {
    res.send('Plant is getting bigger');
});

// ------------------- EXPORT -------------------
module.exports = app;

// Local development
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Plant server is running on port ${port}`);
    });
}
