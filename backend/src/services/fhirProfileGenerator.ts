import { R4 } from '@ahryman40k/ts-fhir-types';

export interface ProfileGenerationRequest {
  profileName: string;
  baseResourceType: string;
  baseProfile?: string;
  description: string;
  fhirVersion: 'R4' | 'R5' | 'R6';
  publisher: string;
  jurisdiction?: string;
  mustSupportElements: string[];
  cardinalityConstraints?: {
    element: string;
    min: number;
    max: string; // can be number or '*'
  }[];
  extensions?: {
    url: string;
    description: string;
  }[];
  bindingConstraints?: {
    element: string;
    valueSetUrl: string;
    strength: 'required' | 'extensible' | 'preferred' | 'example';
  }[];
}

export class FHIRProfileGenerator {
  /**
   * Generate a FHIR StructureDefinition for R4
   */
  generateR4Profile(request: ProfileGenerationRequest): R4.IStructureDefinition {
    const profileId = this.generateProfileId(request.profileName);
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
      publisher: request.publisher,
      date: new Date().toISOString(),
      differential: {
        element: this.buildDifferentialElements(request)
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

  /**
   * Generate profile ID from name (camelCase, no spaces)
   */
  private generateProfileId(name: string): string {
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

  /**
   * Build differential elements based on constraints
   */
  private buildDifferentialElements(request: ProfileGenerationRequest): R4.IElementDefinition[] {
    const elements: R4.IElementDefinition[] = [];

    // Add base element with description
    elements.push({
      id: request.baseResourceType,
      path: request.baseResourceType,
      short: request.profileName,
      definition: request.description
    });

    // Add must-support elements
    request.mustSupportElements.forEach(elementPath => {
      const element: R4.IElementDefinition = {
        id: elementPath,
        path: elementPath,
        mustSupport: true
      };
      elements.push(element);
    });

    // Add cardinality constraints
    request.cardinalityConstraints?.forEach(constraint => {
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

    // Add binding constraints
    request.bindingConstraints?.forEach(binding => {
      const existingElement = elements.find(e => e.path === binding.element);
      const bindingDefinition: R4.IElementDefinition_Binding = {
        strength: this.mapBindingStrength(binding.strength),
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

    // Add extensions as separate elements
    request.extensions?.forEach((ext, index) => {
      elements.push({
        id: `${request.baseResourceType}.extension:ext${index}`,
        path: `${request.baseResourceType}.extension`,
        sliceName: `ext${index}`,
        short: ext.description,
        min: 0,
        max: '1',
        type: [
          {
            code: 'Extension',
            profile: [ext.url]
          }
        ]
      });
    });

    return elements;
  }

  /**
   * Map binding strength to R4 enum
   */
  private mapBindingStrength(strength: string): R4.ElementDefinition_BindingStrengthKind {
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

  /**
   * Validate a FHIR resource against a profile
   * This is a simplified validation - in production, use HAPI FHIR validator
   */
  validateResource(resource: any, profile: R4.IStructureDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check resource type matches
    if (resource.resourceType !== profile.type) {
      errors.push(`Resource type ${resource.resourceType} does not match profile type ${profile.type}`);
    }

    // Check must-support elements are present
    const mustSupportElements = profile.differential?.element?.filter(e => e.mustSupport) || [];
    mustSupportElements.forEach(element => {
      const path = element.path?.split('.').slice(1); // Remove resource type prefix
      if (path && path.length > 0) {
        let value = resource;
        for (const part of path) {
          value = value?.[part];
        }
        if (value === undefined || value === null) {
          errors.push(`Must-support element ${element.path} is missing`);
        }
      }
    });

    // Check cardinality constraints
    profile.differential?.element?.forEach(element => {
      if (element.min !== undefined && element.min > 0) {
        const path = element.path?.split('.').slice(1);
        if (path && path.length > 0) {
          let value = resource;
          for (const part of path) {
            value = value?.[part];
          }
          if (value === undefined || value === null) {
            errors.push(`Required element ${element.path} (min: ${element.min}) is missing`);
          }
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const fhirProfileGenerator = new FHIRProfileGenerator();
