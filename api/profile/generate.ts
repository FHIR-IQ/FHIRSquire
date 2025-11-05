import type { VercelRequest, VercelResponse } from '@vercel/node';
import { R4 } from '@ahryman40k/ts-fhir-types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const request = req.body;

    // Validate required fields
    if (!request.profileName || !request.baseResourceType || !request.description || !request.fhirVersion) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    let profile: any;

    if (request.fhirVersion === 'R4') {
      profile = generateR4Profile(request);
    } else {
      // For R5/R6, generate basic R4 for now
      profile = generateR4Profile(request);
    }

    return res.status(200).json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    console.error('Error generating profile:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generateR4Profile(request: any): R4.IStructureDefinition {
  const profileId = generateProfileId(request.profileName);
  const canonicalUrl = `http://example.org/fhir/StructureDefinition/${profileId}`;

  const structureDefinition: R4.IStructureDefinition = {
    resourceType: 'StructureDefinition',
    id: profileId,
    url: canonicalUrl,
    version: '0.1.0',
    name: profileId,
    title: request.profileName,
    status: R4.StructureDefinitionStatusKind._draft,
    description: request.description,
    fhirVersion: R4.StructureDefinitionFhirVersionKind._4_0_1,
    kind: R4.StructureDefinitionKindKind._resource,
    abstract: false,
    type: request.baseResourceType as R4.StructureDefinitionTypeKind,
    baseDefinition: request.baseProfile || `http://hl7.org/fhir/StructureDefinition/${request.baseResourceType}`,
    derivation: R4.StructureDefinitionDerivationKind._constraint,
    publisher: request.publisher || 'FHIRSquire',
    date: new Date().toISOString(),
    differential: {
      element: buildDifferentialElements(request)
    }
  };

  if (request.jurisdiction) {
    structureDefinition.jurisdiction = [
      {
        coding: [
          {
            system: 'urn:iso:std:iso:3166',
            code: request.jurisdiction
          }
        ]
      }
    ];
  }

  return structureDefinition;
}

function generateProfileId(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

function buildDifferentialElements(request: any): R4.IElementDefinition[] {
  const elements: R4.IElementDefinition[] = [];

  // Add base element with description
  elements.push({
    id: request.baseResourceType,
    path: request.baseResourceType,
    short: request.profileName,
    definition: request.description
  });

  // Add must-support elements
  if (request.mustSupportElements && Array.isArray(request.mustSupportElements)) {
    request.mustSupportElements.forEach((elementPath: string) => {
      const element: R4.IElementDefinition = {
        id: elementPath,
        path: elementPath,
        mustSupport: true
      };
      elements.push(element);
    });
  }

  // Add cardinality constraints
  if (request.cardinalityConstraints && Array.isArray(request.cardinalityConstraints)) {
    request.cardinalityConstraints.forEach((constraint: any) => {
      const existingElement = elements.find(e => e.path === constraint.element);
      if (existingElement) {
        existingElement.min = constraint.min;
        existingElement.max = constraint.max;
      } else {
        elements.push({
          id: constraint.element,
          path: constraint.element,
          min: constraint.min,
          max: constraint.max
        });
      }
    });
  }

  // Add binding constraints
  if (request.bindingConstraints && Array.isArray(request.bindingConstraints)) {
    request.bindingConstraints.forEach((binding: any) => {
      const existingElement = elements.find(e => e.path === binding.element);
      const bindingDefinition: R4.IElementDefinition_Binding = {
        strength: mapBindingStrength(binding.strength),
        valueSet: binding.valueSetUrl
      };

      if (existingElement) {
        existingElement.binding = bindingDefinition;
      } else {
        elements.push({
          id: binding.element,
          path: binding.element,
          binding: bindingDefinition
        });
      }
    });
  }

  return elements;
}

function mapBindingStrength(strength: string): R4.ElementDefinition_BindingStrengthKind {
  switch (strength) {
    case 'required':
      return R4.ElementDefinition_BindingStrengthKind._required;
    case 'extensible':
      return R4.ElementDefinition_BindingStrengthKind._extensible;
    case 'preferred':
      return R4.ElementDefinition_BindingStrengthKind._preferred;
    case 'example':
      return R4.ElementDefinition_BindingStrengthKind._example;
    default:
      return R4.ElementDefinition_BindingStrengthKind._example;
  }
}
