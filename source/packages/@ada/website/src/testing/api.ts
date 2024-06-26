/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0 */
import * as fixtures from './__fixtures__';
import { MOCK_API_CLIENT as API } from '@ada/api-client/mock';
import { CreateAndUpdateDetails } from '@ada/api';
import { DATAPRODUCT_PREVIEW, DATAPRODUCT_PREVIEW_ID } from './__fixtures__';
import { DefaultGroupIds, LensIds, OntologyNamespace, QueryExecutionStatus } from '@ada/common';
import { TEST_USER } from '$common/entity/user';
import { delay, getOntologyIdString } from '$common/utils';

/**
 * Basic mocking placeholders for common api operations.
 * Other than user operations, these should return empty results to unblock basic test rendering.
 */
export function applyDefaultApiOperationMocks() {
  // Identity (users, groups, machines, tokens)
  API.listIdentityUsers.mockResolvedValue({ users: fixtures.USERS } as never);
  API.listIdentityGroups.mockResolvedValue({ groups: fixtures.GROUPS } as never);
  API.getIdentityMachine.mockResolvedValue({ machineId: TEST_USER.id } as never);
  API.listIdentityMachineTokens.mockResolvedValue({ tokens: [] } as never);

  // Domains
  API.getDataProductDomain.mockResolvedValue(fixtures.DOMAIN as never);
  API.listDataProductDomains.mockResolvedValue({ domains: fixtures.DOMAINS } as never);

  applyDataProductApiMocks();

  applyGovernanceApiMocks();

  applyIdentityProviderApiMocks();

  applyNotificationApiMocks();

  applyApiAccessPolicyMocks();
}

export function applyDataProductApiMocks() {
  API.listDataProductDomainDataProducts.mockResolvedValue({ dataProducts: fixtures.DATA_PRODUCTS } as never);

  //@ts-ignore
  API.getDataProductDomainDataProduct.mockImplementation(async ({ domainId, dataProductId }) => {
    const entity = fixtures.DATA_PRODUCTS.find((fixture) => {
      return fixture.domainId === domainId && fixture.dataProductId === dataProductId;
    });
    if (entity) return entity;
    throw new Error('Data Product not found!');
  });

  //@ts-ignore
  API.getGovernancePolicyDomainDataProduct.mockImplementation(async ({ domainId, dataProductId }) => {
    return (
      fixtures.DATA_PRODUCT_POLICIES.find((fixture) => {
        return fixture.domainId === domainId && fixture.dataProductId === dataProductId;
      }) || { domainId, dataProductId, permissions: {} }
    );
  });

  //@ts-ignore
  API.postDataProductScriptsValidate.mockResolvedValue({ report: { errors: [], passed: true } } as never);

  API.postDataProductPreviewDomainDataProduct.mockResolvedValue({ previewId: DATAPRODUCT_PREVIEW_ID } as never);
  API.getDataProductPreviewDomainDataProduct.mockResolvedValue(DATAPRODUCT_PREVIEW as never);
}

export function applyGovernanceApiMocks() {
  API.listOntologies.mockResolvedValue({ ontologies: fixtures.ONTOLOGIES } as never);

  //@ts-ignore
  API.getOntology.mockImplementation(async ({ ontologyNamespace, ontologyId }): Promise<any> => {
    return fixtures.ONTOLOGIES.find(
      (fixture) => getOntologyIdString(fixture) === getOntologyIdString({ ontologyId, ontologyNamespace }),
    );
  });

  API.getGovernancePolicyAttributes.mockResolvedValue({ attributeIdToLensId: {} } as never);

  API.getGovernancePolicyAttributes.mockResolvedValue({ attributeIdToLensId: {} } as never);

  //@ts-ignore
  API.getGovernancePolicyAttributesGroup.mockImplementation(async ({ group, attributeId, ontologyNamespace }) => {
    const namespaceAndAttributeId = getOntologyIdString({ ontologyId: attributeId, ontologyNamespace });
    const crud: CreateAndUpdateDetails =
      ontologyNamespace === OntologyNamespace.PII_CLASSIFICATIONS ? fixtures.SYSTEN_ENTITY_CRUD : fixtures.ENTITY_CRUD;
    switch (group) {
      case DefaultGroupIds.DEFAULT: {
        return {
          group,
          namespaceAndAttributeId,
          lensId: LensIds.HIDDEN,
          ...crud,
        };
      }
      case DefaultGroupIds.POWER_USER: {
        return {
          group,
          namespaceAndAttributeId,
          lensId: LensIds.HASHED,
          ...crud,
        };
      }
      case DefaultGroupIds.ADMIN: {
        return {
          group,
          namespaceAndAttributeId,
          lensId: LensIds.CLEAR,
          ...crud,
        };
      }
    }

    return {
      group,
      namespaceAndAttributeId,
    };
  });

  //@ts-ignore
  API.getGovernancePolicyAttributeValuesGroup.mockImplementation(async ({ group, attributeId, ontologyNamespace }) => {
    const namespaceAndAttributeId = getOntologyIdString({ ontologyId: attributeId, ontologyNamespace });
    const crud: CreateAndUpdateDetails =
      ontologyNamespace === OntologyNamespace.PII_CLASSIFICATIONS ? fixtures.SYSTEN_ENTITY_CRUD : fixtures.ENTITY_CRUD;
    switch (group) {
      case DefaultGroupIds.DEFAULT: {
        return {
          group,
          namespaceAndAttributeId,
          sqlClause: 'not_default IS NOT true',
          ...crud,
        };
      }
      case DefaultGroupIds.POWER_USER: {
        return {
          group,
          namespaceAndAttributeId,
          sqlClause: 'not_power IS NOT true',
          ...crud,
        };
      }
      case DefaultGroupIds.ADMIN: {
        return {
          group,
          namespaceAndAttributeId,
          ...crud,
        };
      }
    }

    return {
      group,
      namespaceAndAttributeId,
    };
  });
}

export function applyIdentityProviderApiMocks() {
  API.listIdentityProviders.mockResolvedValue({ providers: fixtures.IDENTITY_PROVIDERS } as never);

  //@ts-ignore
  API.getIdentityProvider.mockImplementation(async ({ identityProviderId }): Promise<any> => {
    const entity = fixtures.IDENTITY_PROVIDERS.find((fixture) => fixture.identityProviderId === identityProviderId);
    if (entity) return entity;
    throw new Error('Identity Provider not found!');
  });
}

export function applyQueryExecutionApiMocks(variant?: 'delayed') {
  switch (variant) {
    case 'delayed': {
      //@ts-ignore
      API.postQuery.mockImplementation(async () => {
        await delay(100);
        return fixtures.QUERY_EXECUTION;
      });

      [QueryExecutionStatus.QUEUED, QueryExecutionStatus.RUNNING, QueryExecutionStatus.SUCCEEDED].forEach((status) => {
        API.getQueryStatus.mockResolvedValueOnce({ status } as never);
      });

      API.getQueryStatus.mockResolvedValue({
        status: QueryExecutionStatus.SUCCEEDED,
      } as never);

      //@ts-ignore
      API.listQueryResults.mockImplementation(async () => {
        await delay(100);
        return fixtures.QUERY_EXECUTION_RESULT;
      });
      break;
    }
    default: {
      API.postQuery.mockResolvedValue(fixtures.QUERY_EXECUTION as never);

      API.getQueryStatus.mockResolvedValue({
        status: QueryExecutionStatus.SUCCEEDED,
      } as never);

      API.listQueryResults.mockResolvedValue({
        ...fixtures.QUERY_EXECUTION_RESULT,
      } as never);
    }
  }
}

export function applyNotificationApiMocks() {
  API.listNotifications.mockResolvedValue({ notifications: fixtures.NOTIFICATIONS } as never);
}

export function applyApiAccessPolicyMocks() {
  API.listApiAccessPolicies.mockResolvedValue({ policies: fixtures.API_ACCESS_POLICIES } as never);

  //@ts-ignore
  API.getApiAccessPolicy.mockImplementation((params) => {
    const policy = fixtures.API_ACCESS_POLICIES.find((policy) => policy.apiAccessPolicyId === params.apiAccessPolicyId);
    if (policy) return Promise.resolve(policy);
    return Promise.reject({ message: 'Not found' });
  });
}
