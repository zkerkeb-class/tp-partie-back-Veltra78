import mongoose from 'mongoose';
import pokemon from '../schema/pokemon.js';
import pokemonsList from './pokemonsList.js';
import '../connect.js';

const seedDatabase = async () => {
    try {
        // Attendre que la connexion soit établie
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('🔄 Suppression des pokémons existants...');
        await pokemon.deleteMany({});
        
        console.log(`📥 Insertion de ${pokemonsList.length} pokémons...`);
        const result = await pokemon.insertMany(pokemonsList);
        
        console.log(`✅ ${result.length} pokémons insérés avec succès !`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de l\'insertion :', error);
        process.exit(1);
    }
};

seedDatabase();
