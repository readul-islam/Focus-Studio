import json
import boto3
from django.conf import settings
from openai import OpenAI

def normalize_url(url):
    """Ensures the URL has a protocol."""
    if not url:
        return url
    if url.startswith('//'):
        return f'https:{url}'
    if not url.startswith('http'):
        # This handles cases like 'example.com/...' which are rare but possible
        # but most often it's just //
        return f'https://{url}'
    return url

def extract_product_data(content, image_urls=None):
    """
    Uses OpenAI to extract structured product data from page content
    and select main images from a provided list of image URLs.
    """
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    normalized_images = [normalize_url(url) for url in image_urls] if image_urls else []
    image_list_str = "\n".join(normalized_images) if normalized_images else "No images provided."
    
    prompt = f"""
    You are an expert at extracting product information from web page content.
    Analyze the following content and extract the product details into a JSON format.
    
    The target fields are:
    - name: Product name
    - supplier_name: The name of the company or brand that manufactures or supplies this product.
    - description: Brief description
    - currency: 3-letter currency code (e.g., USD, GBP, EUR)
    - trade_price: Price for professionals/trade (float)
    - regular_price: Retail price (float)
    - materials: Materials used
    - dimension: Physical dimensions
    - weight: Weight
    - box_dimension: Packaging dimensions
    - assembly_required: Boolean
    - seat_width: Seat width if applicable
    - seat_depth: Seat depth if applicable
    - seat_height: Seat height if applicable
    - composition: Composition details
    - construction: Construction details
    - feet: Feet height or type
    - filling: Filling materials
    - removeable_cushion: Boolean
    - removeable_legs: Boolean
    - frame: Frame material
    - type: Product type or category
    - images: From the list of provided image URLs below, select ONLY the images that represent the main product (e.g., front view, full product shot). Exclude icons, thumbnails, or promotional banners.
    
    Provided Image URLs:
    {image_list_str}
    
    Return ONLY a valid JSON object. If a field is not found, use null or false for booleans.
    
    Content:
    {content}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that outputs JSON."},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"}
    )
    
    try:
        data = json.loads(response.choices[0].message.content)
        return data
    except (json.JSONDecodeError, AttributeError, IndexError):
        return None

def extract_product_data_nova(content, image_urls=None):
    """
    Uses AWS Nova 2 Lite to extract structured product data from page content
    and select main images from a provided list of image URLs.
    """
    bedrock = boto3.client(
        service_name='bedrock-runtime',
        region_name='us-east-1',  # Nova is typically available in us-east-1
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )
    
    normalized_images = [normalize_url(url) for url in image_urls] if image_urls else []
    image_list_str = "\n".join(normalized_images) if normalized_images else "No images provided."
    
    prompt = f"""
    You are an expert at extracting product information from web page content.
    Analyze the following content and extract the product details into a JSON format.
    
    The target fields are:
    - name: Product name
    - supplier_name: The name of the company or brand that manufactures or supplies this product.
    - description: Brief description
    - currency: 3-letter currency code (e.g., USD, GBP, EUR)
    - trade_price: Price for professionals/trade (float)
    - regular_price: Retail price (float)
    - materials: Materials used
    - dimension: Physical dimensions
    - weight: Weight
    - box_dimension: Packaging dimensions
    - assembly_required: Boolean
    - seat_width: Seat width if applicable
    - seat_depth: Seat depth if applicable
    - seat_height: Seat height if applicable
    - composition: Composition details
    - construction: Construction details
    - feet: Feet height or type
    - filling: Filling materials
    - removeable_cushion: Boolean
    - removeable_legs: Boolean
    - frame: Frame material
    - type: Product type or category
    - images: From the list of provided image URLs below, select ONLY the images that represent the main product (e.g., front view, full product shot). Exclude icons, thumbnails, or promotional banners.
    
    Provided Image URLs:
    {image_list_str}
    
    Return ONLY a valid JSON object. If a field is not found, use null or false for booleans.
    
    Content:
    {content}
    """
    
    body = {
        "messages": [
            {
                "role": "user",
                "content": [{"text": prompt}]
            }
        ],
        "system": [{"text": "You are a helpful assistant that outputs ONLY valid JSON."}],
        "inferenceConfig": {
            "max_new_tokens": 4096,
            "temperature": 0,
            "top_p": 0.9,
        }
    }
    
    try:
        response = bedrock.invoke_model(
            modelId='us.amazon.nova-2-lite-v1:0',
            body=json.dumps(body)
        )
        
        response_body = json.loads(response['body'].read())
        output_text = response_body['output']['message']['content'][0]['text']
        
        # Clean up in case Nova includes markdown code blocks
        if "```json" in output_text:
            output_text = output_text.split("```json")[1].split("```")[0].strip()
        elif "```" in output_text:
            output_text = output_text.split("```")[1].split("```")[0].strip()
            
        data = json.loads(output_text)
        return data
    except Exception as e:
        print(f"Error calling AWS Nova: {str(e)}")
        return None
