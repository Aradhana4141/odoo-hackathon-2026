from datetime import date
from fastapi import APIRouter,File,Form,HTTPException,UploadFile,status
from app.api.dependencies import FleetManager
from app.services.pocketbase import pb

router=APIRouter(tags=["Uploads & Documents"])
MAX_FILE_SIZE=10*1024*1024
IMAGE_TYPES={"image/jpeg","image/png","image/webp"}


async def read_limited(file:UploadFile,allowed:set[str]|None=None)->bytes:
    if allowed and file.content_type not in allowed:
        raise HTTPException(415,f"Unsupported file type: {file.content_type}")
    content=await file.read(MAX_FILE_SIZE+1)
    if len(content)>MAX_FILE_SIZE: raise HTTPException(413,"File exceeds the 10 MB limit")
    return content


@router.post("/vehicles/{vehicle_id}/image")
async def upload_vehicle_image(vehicle_id:str,user:FleetManager,image:UploadFile=File(...)):
    await pb.get("Vehicles",vehicle_id)
    content=await read_limited(image,IMAGE_TYPES)
    return await pb.upload("Vehicles",vehicle_id,[("image",(image.filename or "vehicle.jpg",content,image.content_type or "image/jpeg"))])


@router.post("/vehicles/{vehicle_id}/documents",status_code=status.HTTP_201_CREATED)
async def upload_vehicle_document(
    vehicle_id:str,user:FleetManager,file:UploadFile=File(...),documentType:str=Form(...),expiryDate:date|None=Form(None)
):
    await pb.get("Vehicles",vehicle_id)
    content=await read_limited(file)
    data={"vehicle":vehicle_id,"documentType":documentType}
    if expiryDate: data["expiryDate"]=expiryDate.isoformat()
    return await pb.create_multipart("Documents",data,[("file",(file.filename or "document",content,file.content_type or "application/octet-stream"))],expand="vehicle")


@router.get("/vehicles/{vehicle_id}/documents")
async def list_vehicle_documents(vehicle_id:str,user:FleetManager):
    return await pb.list("Documents",filter=f'vehicle="{vehicle_id}"',sort="-created",expand="vehicle",perPage=100)


@router.delete("/documents/{document_id}",status_code=204)
async def delete_document(document_id:str,user:FleetManager): await pb.delete("Documents",document_id)
