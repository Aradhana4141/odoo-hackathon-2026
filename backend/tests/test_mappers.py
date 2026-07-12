from app.services.mappers import driver,expense,maintenance,trip,vehicle


def test_vehicle_maps_schema_typo_and_status():
    result=vehicle({"id":"v1","registrationNumber":"KA-01","model":"Van","vehileType":"Van","capacityKg":500,"status":"In_Shop"})
    assert result["type"]=="Van" and result["status"]=="IN_SHOP"


def test_driver_falls_back_to_compatible_fields():
    result=driver({"id":"d1","address":"Alex","emergencyContact":"999","status":"Available","expiryDate":"2030-01-01 00:00:00.000Z"})
    assert result["name"]=="Alex" and result["contact"]=="999" and result["expiryDate"]=="2030-01-01"


def test_trip_expands_relations():
    result=trip({"id":"t1","vehicle":"v1","driver":"d1","status":"Draft","expand":{"vehicle":{"id":"v1","status":"Available"},"driver":{"id":"d1","status":"Available"}}})
    assert result["vehicle"]["id"]=="v1" and result["driver"]["id"]=="d1" and result["status"]=="DRAFT"
