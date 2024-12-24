export type Poip = {
  "version": "0.1.0",
  "name": "poip",
  "instructions": [
    {
      "name": "createUserAccount",
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deleteUserAccount",
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createIpAccount",
      "accounts": [
        {
          "name": "ipAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        },
        {
          "name": "link",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteIpAccount",
      "accounts": [
        {
          "name": "ipAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        }
      ]
    },
    {
      "name": "publish",
      "accounts": [
        {
          "name": "ciAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ipAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "goalcount",
          "type": "u64"
        },
        {
          "name": "maxcount",
          "type": "u64"
        },
        {
          "name": "contractType",
          "type": "u64"
        }
      ]
    },
    {
      "name": "pay",
      "accounts": [
        {
          "name": "cpAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ciAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ipAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        }
      ]
    },
    {
      "name": "withraw",
      "accounts": [
        {
          "name": "ciAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ipAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        }
      ]
    },
    {
      "name": "bonus",
      "accounts": [
        {
          "name": "ciAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cpAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ipAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ipid",
            "type": "string"
          },
          {
            "name": "link",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "ownership",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userAccount",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "ciAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "contractType",
            "type": "u64"
          },
          {
            "name": "goalcount",
            "type": "u64"
          },
          {
            "name": "currcount",
            "type": "u64"
          },
          {
            "name": "maxcount",
            "type": "u64"
          },
          {
            "name": "withdrawalCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "cpAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "withdrawal",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "LamportsNotEnough"
    },
    {
      "code": 6001,
      "name": "GoalAlreadyAchieved"
    },
    {
      "code": 6002,
      "name": "ContractHasNoLamports"
    },
    {
      "code": 6003,
      "name": "WrongIPOwnership"
    },
    {
      "code": 6004,
      "name": "WrongContractType"
    },
    {
      "code": 6005,
      "name": "MathFailure"
    },
    {
      "code": 6006,
      "name": "InvalidPrice"
    },
    {
      "code": 6007,
      "name": "InvalidGoalcount"
    },
    {
      "code": 6008,
      "name": "InvalidMaxcount"
    }
  ]
};

export const IDL: Poip = {
  "version": "0.1.0",
  "name": "poip",
  "instructions": [
    {
      "name": "createUserAccount",
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deleteUserAccount",
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createIpAccount",
      "accounts": [
        {
          "name": "ipAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        },
        {
          "name": "link",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteIpAccount",
      "accounts": [
        {
          "name": "ipAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        }
      ]
    },
    {
      "name": "publish",
      "accounts": [
        {
          "name": "ciAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ipAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "goalcount",
          "type": "u64"
        },
        {
          "name": "maxcount",
          "type": "u64"
        },
        {
          "name": "contractType",
          "type": "u64"
        }
      ]
    },
    {
      "name": "pay",
      "accounts": [
        {
          "name": "cpAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ciAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ipAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        }
      ]
    },
    {
      "name": "withraw",
      "accounts": [
        {
          "name": "ciAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ipAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ownerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        }
      ]
    },
    {
      "name": "bonus",
      "accounts": [
        {
          "name": "ciAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cpAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "ipid",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ipAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ipid",
            "type": "string"
          },
          {
            "name": "link",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "ownership",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "userAccount",
      "type": {
        "kind": "struct",
        "fields": []
      }
    },
    {
      "name": "ciAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "contractType",
            "type": "u64"
          },
          {
            "name": "goalcount",
            "type": "u64"
          },
          {
            "name": "currcount",
            "type": "u64"
          },
          {
            "name": "maxcount",
            "type": "u64"
          },
          {
            "name": "withdrawalCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "cpAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "withdrawal",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "LamportsNotEnough"
    },
    {
      "code": 6001,
      "name": "GoalAlreadyAchieved"
    },
    {
      "code": 6002,
      "name": "ContractHasNoLamports"
    },
    {
      "code": 6003,
      "name": "WrongIPOwnership"
    },
    {
      "code": 6004,
      "name": "WrongContractType"
    },
    {
      "code": 6005,
      "name": "MathFailure"
    },
    {
      "code": 6006,
      "name": "InvalidPrice"
    },
    {
      "code": 6007,
      "name": "InvalidGoalcount"
    },
    {
      "code": 6008,
      "name": "InvalidMaxcount"
    }
  ]
};