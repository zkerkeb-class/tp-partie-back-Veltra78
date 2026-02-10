
import express from 'express';
import pokemon from './schema/pokemon.js';
import cors from 'cors';

import './connect.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir les assets
app.use('/assets', express.static('assets'));

app.get('/', (req, res) => {
  res.send('API Pokémon - Available endpoints: GET /pokemons, GET /pokemons/:id, POST /pokemons, PUT /pokemons/:id, DELETE /pokemons/:id, GET /pokemons/search/:name');
});

// GET all pokemons with pagination (20 par page)
app.get('/pokemons', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const total = await pokemon.countDocuments();
        const pokemons = await pokemon.find({})
            .skip(skip)
            .limit(limit)
            .sort({ id: 1 });

        res.json({
            pokemons,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET pokemon by ID
app.get('/pokemons/:id', async (req, res) => {
    try {
        const poke = await pokemon.findOne({ id: parseInt(req.params.id) });
        if (poke) {
            res.json(poke);
        } else {
            res.status(404).json({ error: 'Pokemon not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search pokemon by name
app.get('/search/:name', async (req, res) => {
    try {
        const searchName = req.params.name.toLowerCase();
        const poke = await pokemon.findOne({
            $or: [
                { 'name.english': { $regex: searchName, $options: 'i' } },
                { 'name.french': { $regex: searchName, $options: 'i' } },
                { 'name.japanese': { $regex: searchName, $options: 'i' } }
            ]
        });
        if (poke) {
            res.json(poke);
        } else {
            res.status(404).json({ error: 'Pokemon not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create a new pokemon
app.post('/pokemons', async (req, res) => {
    try {
        // Trouver le prochain ID disponible
        const lastPokemon = await pokemon.findOne().sort({ id: -1 });
        const nextId = (lastPokemon?.id || 0) + 1;
        const baseURL = process.env.API_URL || 'http://localhost:3000';

        const newPokemon = new pokemon({
            id: nextId,
            name: req.body.name,
            type: req.body.type,
            base: req.body.base,
            image: req.body.image || `${baseURL}/assets/pokemons/${nextId}.png`,
            shinyImage: req.body.shinyImage || `${baseURL}/assets/pokemons/shiny/${nextId}.png`
        });

        const savedPokemon = await newPokemon.save();
        res.status(201).json(savedPokemon);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT update pokemon
app.put('/pokemons/:id', async (req, res) => {
    try {
        const updatedPokemon = await pokemon.findOneAndUpdate(
            { id: parseInt(req.params.id) },
            req.body,
            { new: true, runValidators: true }
        );
        if (updatedPokemon) {
            res.json(updatedPokemon);
        } else {
            res.status(404).json({ error: 'Pokemon not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE pokemon
app.delete('/pokemons/:id', async (req, res) => {
    try {
        const deletedPokemon = await pokemon.findOneAndDelete({ id: parseInt(req.params.id) });
        if (deletedPokemon) {
            res.json({ message: 'Pokemon deleted', pokemon: deletedPokemon });
        } else {
            res.status(404).json({ error: 'Pokemon not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
  console.log('🚀 Server is running on http://localhost:3000');
});