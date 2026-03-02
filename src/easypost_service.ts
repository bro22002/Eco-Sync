import axios from 'axios';

type EasyPostAddress = {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
};

type EasyPostShipment = {
  id: string;
  from_address: EasyPostAddress;
  to_address: EasyPostAddress;
  weight: number; // grams
  custom_fields?: Record<string, string>;
  created_at: string;
  mode?: string; // "test" or "production"
};

const EASYPOST_BASE = 'https://api.easypost.com/v2';

/**
 * Simple wrapper around EasyPost REST API to fetch recent shipments.
 * Requires EASYPOST_API_KEY environment variable.
 */
export class EasyPostService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private authHeader() {
    return { Authorization: `Bearer ${this.apiKey}` };
  }

  /**
   * Fetch a page of shipments (max 100 per page).
   */
  async listShipments(pageSize: number = 50, page: number = 1): Promise<EasyPostShipment[]> {
    const url = `${EASYPOST_BASE}/shipments?page_size=${pageSize}&page=${page}`;
    const resp = await axios.get(url, { headers: this.authHeader() });
    // EasyPost returns { shipments: [...] }
    return resp.data.shipments || [];
  }

  /**
   * Map an EasyPost shipment into our SupplyChainRecord-like object.
   */
  mapToRecord(shipment: EasyPostShipment, index: number) {
    const originParts = [
      shipment.from_address.city,
      shipment.from_address.state,
      shipment.from_address.country,
    ]
      .filter(Boolean)
      .join(', ');
    const destParts = [
      shipment.to_address.city,
      shipment.to_address.state,
      shipment.to_address.country,
    ]
      .filter(Boolean)
      .join(', ');

    const weightKg = shipment.weight / 1000; // convert grams to kg

    // determine transport type from custom_fields or default land
    const transport_type = (shipment.custom_fields?.transport_type as
      | 'air'
      | 'sea'
      | 'land'
      | undefined) || 'land';

    return {
      id: shipment.id || `ep_${index}`,
      origin: originParts || 'Unknown origin',
      destination: destParts || 'Unknown destination',
      weight_kg: Math.round(weightKg),
      transport_type,
      timestamp: shipment.created_at,
    } as any;
  }
}
