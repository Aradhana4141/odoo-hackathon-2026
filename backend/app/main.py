from fastapi import FastAPI,Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.router import router
from app.config import get_settings

settings=get_settings()
app=FastAPI(title=settings.app_name,description="Smart Transport Operations Platform",version="1.0.0",servers=[{"url":"http://localhost:8000","description":"Local Development Server"}])
app.add_middleware(CORSMiddleware,allow_origins=settings.origins,allow_credentials=True,allow_methods=["*"],allow_headers=["*"])

@app.exception_handler(RequestValidationError)
async def validation_error(request:Request,exc:RequestValidationError): return JSONResponse(status_code=422,content={"error":True,"message":"Validation failed","details":{"errors":exc.errors()}})

@app.get("/health",include_in_schema=False)
async def health(): return {"status":"ok","service":"transitops"}

app.include_router(router,prefix=settings.api_prefix)
