"""
Creado por: Omar I. Azar
Fecha de creación: 2028-10-24
Descripción: Aplicacion para el registro y gestión de automóviles utilizando Flask y MongoDB.
"""


import os
import os
from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client.get_database(os.getenv('MONGO_DB', 'car_registry'))
cars = db.cars


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/cars', methods=['GET'])
def api_get_cars():
    car_list = list(cars.find({'activo': True}))
    for car in car_list:
        car['_id'] = str(car['_id'])
    return jsonify(car_list)


@app.route('/api/cars/<car_id>', methods=['GET'])
def api_get_car(car_id):
    try:
        car = cars.find_one({'_id': ObjectId(car_id)})
        if car:
            car['_id'] = str(car['_id'])
            return jsonify(car)
        else:
            return jsonify({'error': 'Car not found'}), 404
    except Exception:
        return jsonify({'error': 'Invalid ID'}), 400


@app.route('/api/cars', methods=['POST'])
def api_add_car():
    car_data = request.json or {}
    try:
        car_data['year'] = int(car_data.get('year', 0))
    except (ValueError, TypeError):
        car_data['year'] = 0
    car_data['activo'] = True
    result = cars.insert_one(car_data)
    return jsonify({'message': 'Car added successfully', 'id': str(result.inserted_id)}), 201

@app.route('/api/cars/<car_id>', methods=['DELETE'])
def api_delete_car(car_id):
    try:
        result = cars.update_one({'_id': ObjectId(car_id)}, {'$set': {'activo': False}})
        if result.matched_count:
            return jsonify({'message': 'Car marked as inactive', 'id': car_id})
        else:
            return jsonify({'error': 'Car not found'}), 404
    except Exception:
        return jsonify({'error': 'Invalid ID'}), 400

@app.route('/api/cars/<car_id>', methods=['PUT'])
def api_update_car(car_id):
    car_data = request.json or {}
    try:
        car_data['year'] = int(car_data.get('year', 0))
    except (ValueError, TypeError):
        car_data['year'] = 0
    try:
        result = cars.update_one({'_id': ObjectId(car_id)}, {'$set': car_data})
        if result.matched_count:
            return jsonify({'message': 'Car updated', 'id': car_id})
        else:
            return jsonify({'error': 'Car not found'}), 404
    except Exception:
        return jsonify({'error': 'Invalid ID'}), 400

@app.route('/api/cars/<car_id>/notes', methods=['GET'])
def get_car_notes(car_id):
    try:
        car = cars.find_one({'_id': ObjectId(car_id)})
        if not car:
            return jsonify({'error': 'Car not found'}), 404
        notes = car.get('notes', [])
        return jsonify(notes)
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/cars/<car_id>/notes', methods=['POST'])
def add_car_note(car_id):
    try:
        note = request.json
        if not note or 'text' not in note:
            return jsonify({'error': 'Note text is required'}), 400
        
        result = cars.update_one(
            {'_id': ObjectId(car_id)},
            {'$push': {'notes': {
                '_id': str(ObjectId()),
                'text': note['text'],
                'date': note.get('date', '')
            }}}
        )
        
        if result.matched_count:
            return jsonify({'message': 'Note added successfully'})
        return jsonify({'error': 'Car not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/cars/<car_id>/notes/<note_id>', methods=['DELETE'])
def delete_car_note(car_id, note_id):
    try:
        result = cars.update_one(
            {'_id': ObjectId(car_id)},
            {'$pull': {'notes': {'_id': note_id}}}
        )
        
        if result.matched_count:
            return jsonify({'message': 'Note deleted successfully'})
        return jsonify({'error': 'Car or note not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)